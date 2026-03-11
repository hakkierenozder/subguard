using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Models;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.Specifications.Notifications;
using SubGuard.Core.Specifications.Subscriptions;
using SubGuard.Core.UnitOfWork;

namespace SubGuard.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IGenericRepository<UserSubscription> _subscriptionRepo;
        private readonly IGenericRepository<NotificationQueue> _queueRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnumerable<INotificationSender> _senders;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IGenericRepository<UserSubscription> subscriptionRepo,
            IGenericRepository<NotificationQueue> queueRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnumerable<INotificationSender> senders,
            UserManager<AppUser> userManager,
            ILogger<NotificationService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _queueRepo = queueRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _senders = senders;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore)
        {
            var targetDate = DateTime.UtcNow.AddDays(daysBefore);
            var targetDay = targetDate.Day;

            var upcomingSubscriptions = await _subscriptionRepo
                .ApplySpecification(new UpcomingPaymentSubscriptionsSpec(targetDay))
                .ToListAsync();

            // Liste boşsa işlem yapma
            if (upcomingSubscriptions == null || !upcomingSubscriptions.Any())
                return;

            foreach (var sub in upcomingSubscriptions)
            {
                // Mükerrer kontrolü (Opsiyonel: Aynı gün aynı kullanıcıya bildirim gitmiş mi?)
                // Şimdilik iş mantığı gereği direkt ekliyoruz.

                var notification = new NotificationQueue
                {
                    UserId = sub.UserId,
                    UserSubscriptionId = sub.Id,
                    Title = "Ödeme Hatırlatması",
                    Message = $"{sub.Name} aboneliğinizin ödemesi {daysBefore} gün sonra. Tutar: {sub.Price} {sub.Currency}",
                    ScheduledDate = DateTime.UtcNow,
                    IsSent = false,
                    CreatedDate = DateTime.UtcNow
                };

                await _queueRepo.AddAsync(notification);
            }

            await _unitOfWork.CommitAsync();
        }

        public async Task<CustomResponseDto<PagedResponseDto<NotificationDto>>> GetUserNotificationsAsync(string userId, int page, int pageSize)
        {
            var query = _queueRepo.Where(x => x.UserId == userId);
            var totalCount = await query.CountAsync();

            var notifications = await query
                .OrderByDescending(x => x.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResponseDto<NotificationDto>
            {
                Items = _mapper.Map<List<NotificationDto>>(notifications),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return CustomResponseDto<PagedResponseDto<NotificationDto>>.Success(200, result);
        }

        public async Task<CustomResponseDto<bool>> MarkAsReadAsync(int id, string userId)
        {
            var notification = await _queueRepo.GetByIdAsync(id);

            if (notification == null)
                return CustomResponseDto<bool>.Fail(404, "Bildirim bulunamadı.");

            if (notification.UserId != userId)
                return CustomResponseDto<bool>.Fail(403, "Bu bildirime erişim yetkiniz yok.");

            notification.IsRead = true;
            notification.ReadDate = DateTime.UtcNow;
            _queueRepo.Update(notification);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task<CustomResponseDto<bool>> DeleteNotificationAsync(int id, string userId)
        {
            var notification = await _queueRepo.GetByIdAsync(id);

            if (notification == null)
                return CustomResponseDto<bool>.Fail(404, "Bildirim bulunamadı.");

            if (notification.UserId != userId)
                return CustomResponseDto<bool>.Fail(403, "Bu bildirime erişim yetkiniz yok.");

            _queueRepo.Remove(notification);
            await _unitOfWork.CommitAsync();

            return CustomResponseDto<bool>.Success(200, true);
        }

        public async Task ProcessNotificationQueueAsync()
        {
            var pending = await _queueRepo
                .ApplySpecification(new UnsentNotificationsSpec())
                .ToListAsync();

            if (!pending.Any()) return;

            int sent = 0;
            int failed = 0;

            foreach (var notification in pending)
            {
                var user = await _userManager.FindByIdAsync(notification.UserId);
                if (user == null) continue;

                try
                {
                    var sub = await _subscriptionRepo.GetByIdAsync(notification.UserSubscriptionId);
                    int daysUntil = sub != null
                        ? Math.Max(0, (int)(notification.ScheduledDate.Date - DateTime.UtcNow.Date).TotalDays)
                        : 0;

                    var htmlBody = EmailTemplates.PaymentReminder(
                        userName: user.FullName ?? user.Email!,
                        subscriptionName: notification.Title.Replace("Ödeme Hatırlatması", sub?.Name ?? "Abonelik").Trim(),
                        price: sub?.Price ?? 0,
                        currency: sub?.Currency ?? "",
                        daysUntil: daysUntil
                    );

                    var message = new NotificationMessage
                    {
                        ToEmail   = user.Email!,
                        ToName    = user.FullName ?? user.Email!,
                        PushToken = user.ExpoPushToken,
                        Title     = notification.Title,
                        Body      = notification.Message,
                        HtmlBody  = htmlBody,
                        Data      = new { subscriptionId = notification.UserSubscriptionId }
                    };

                    foreach (var sender in _senders)
                        await sender.SendAsync(message);

                    notification.IsSent = true;
                    notification.SentDate = DateTime.UtcNow;
                    notification.ErrorMessage = null;
                    sent++;
                }
                catch (Exception ex)
                {
                    notification.ErrorMessage = ex.Message;
                    failed++;
                    _logger.LogError(ex, "Bildirim gönderilemedi. NotificationId: {Id}, UserId: {UserId}",
                        notification.Id, notification.UserId);
                }

                _queueRepo.Update(notification);
            }

            await _unitOfWork.CommitAsync();
            _logger.LogInformation("Bildirim kuyruğu işlendi. Gönderilen: {Sent}, Başarısız: {Failed}", sent, failed);
        }

        public async Task<CustomResponseDto<bool>> RegisterPushTokenAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            user.ExpoPushToken = token;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Push token kaydedildi. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(200, true);
        }
    }
}