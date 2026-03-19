using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
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
        private readonly AppDbContext _db;

        public NotificationService(
            IGenericRepository<UserSubscription> subscriptionRepo,
            IGenericRepository<NotificationQueue> queueRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnumerable<INotificationSender> senders,
            UserManager<AppUser> userManager,
            ILogger<NotificationService> logger,
            AppDbContext db)
        {
            _subscriptionRepo = subscriptionRepo;
            _queueRepo = queueRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _senders = senders;
            _userManager = userManager;
            _logger = logger;
            _db = db;
        }

        // --- #15 Mükerrer korumalı ödeme hatırlatması ---
        public async Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore)
        {
            var trTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            var currentHour = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, trTimeZone).Hour;

            var targetDate = DateTime.UtcNow.AddDays(daysBefore);
            var targetDay = targetDate.Day;

            var upcomingSubscriptions = await _subscriptionRepo
                .ApplySpecification(new UpcomingPaymentSubscriptionsSpec(targetDay))
                .ToListAsync();

            if (upcomingSubscriptions == null || !upcomingSubscriptions.Any())
                return;

            var today = DateTime.UtcNow.Date;

            foreach (var sub in upcomingSubscriptions)
            {
                // Kullanıcının belirlediği saatte değilse atla
                var subUser = await _userManager.FindByIdAsync(sub.UserId);
                if (subUser != null && subUser.NotifyHour != currentHour) continue;

                // #15: Aynı abonelik için bugün zaten bildirim kuyruğa alınmış mı?
                var alreadyQueued = await _queueRepo
                    .Where(x => x.UserId == sub.UserId
                             && x.UserSubscriptionId == sub.Id
                             && x.Type == NotificationType.Payment
                             && !x.IsSent
                             && x.ScheduledDate >= today)
                    .AnyAsync();

                if (alreadyQueued) continue;

                var notification = new NotificationQueue
                {
                    UserId = sub.UserId,
                    UserSubscriptionId = sub.Id,
                    Title = "Ödeme Hatırlatması",
                    Message = $"{sub.Name} aboneliğinizin ödemesi {daysBefore} gün sonra. Tutar: {sub.Price} {sub.Currency}",
                    ScheduledDate = today,
                    IsSent = false,
                    Type = NotificationType.Payment,
                    CreatedDate = DateTime.UtcNow
                };

                await _queueRepo.AddAsync(notification);
            }

            await _unitOfWork.CommitAsync();
        }

        // --- #11 Bütçe aşım bildirimi ---
        public async Task CheckAndQueueBudgetAlertsAsync()
        {
            var usersWithBudget = await _userManager.Users
                .Where(u => u.MonthlyBudget > 0 && u.MonthlyBudgetCurrency != null)
                .ToListAsync();

            if (!usersWithBudget.Any()) return;

            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            foreach (var user in usersWithBudget)
            {
                // Bu ay zaten bildirim gönderilmiş mi?
                var alreadyQueued = await _queueRepo
                    .Where(x => x.UserId == user.Id
                             && x.Type == NotificationType.Budget
                             && x.ScheduledDate >= startOfMonth)
                    .AnyAsync();

                if (alreadyQueued) continue;

                // Sadece aynı para birimindeki aktif abonelikleri topla
                var subscriptions = await _subscriptionRepo
                    .Where(x => x.UserId == user.Id
                             && x.Status == SubscriptionStatus.Active
                             && x.Currency == user.MonthlyBudgetCurrency)
                    .ToListAsync();

                var totalMonthly = subscriptions.Sum(s =>
                    s.BillingPeriod == BillingPeriod.Yearly ? s.Price / 12m : s.Price);

                if (totalMonthly <= user.MonthlyBudget) continue;

                var exceeded = totalMonthly - user.MonthlyBudget;

                var notification = new NotificationQueue
                {
                    UserId = user.Id,
                    UserSubscriptionId = null,
                    Title = "Bütçe Aşıldı",
                    Message = $"Aylık abonelik harcamanız ({totalMonthly:F2} {user.MonthlyBudgetCurrency}), " +
                              $"bütçenizi ({user.MonthlyBudget:F2} {user.MonthlyBudgetCurrency}) " +
                              $"{exceeded:F2} {user.MonthlyBudgetCurrency} aşıyor.",
                    ScheduledDate = today,
                    IsSent = false,
                    Type = NotificationType.Budget,
                    CreatedDate = DateTime.UtcNow
                };

                await _queueRepo.AddAsync(notification);
                _logger.LogInformation(
                    "Bütçe aşım bildirimi kuyruğa eklendi. UserId: {UserId}, Toplam: {Total}, Bütçe: {Budget}",
                    user.Id, totalMonthly, user.MonthlyBudget);
            }

            await _unitOfWork.CommitAsync();

            // --- Kategori bazlı bütçe uyarıları ---
            var usersWithCategoryBudgets = await _db.CategoryBudgets
                .Where(b => !b.IsDeleted)
                .Select(b => b.UserId)
                .Distinct()
                .ToListAsync();

            foreach (var userId in usersWithCategoryBudgets)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.MonthlyBudgetCurrency == null) continue;

                var threshold = user.BudgetAlertThreshold > 0 ? user.BudgetAlertThreshold : 80;
                var currency = user.MonthlyBudgetCurrency;

                var catBudgets = await _db.CategoryBudgets
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .ToListAsync();

                // Kullanıcının aktif aboneliklerini grup halinde çek
                var subs = await _subscriptionRepo
                    .Where(s => s.UserId == userId
                             && s.Status == SubscriptionStatus.Active
                             && s.Currency == currency)
                    .ToListAsync();

                var spendingByCategory = subs
                    .GroupBy(s => s.Category)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(s => s.BillingPeriod == BillingPeriod.Yearly ? s.Price / 12m : s.Price)
                    );

                foreach (var catBudget in catBudgets)
                {
                    var spent = spendingByCategory.TryGetValue(catBudget.Category, out var s) ? s : 0m;
                    var limitThreshold = catBudget.MonthlyLimit * threshold / 100m;

                    if (spent < limitThreshold) continue;

                    // Bu ay bu kategori için zaten bildirim var mı?
                    var catAlreadyQueued = await _queueRepo
                        .Where(x => x.UserId == userId
                                 && x.Type == NotificationType.Budget
                                 && x.ScheduledDate >= startOfMonth
                                 && x.Message.Contains($"[{catBudget.Category}]"))
                        .AnyAsync();

                    if (catAlreadyQueued) continue;

                    var title = spent > catBudget.MonthlyLimit
                        ? $"{catBudget.Category} Bütçesi Aşıldı"
                        : $"{catBudget.Category} Bütçe Uyarısı";

                    var message = spent > catBudget.MonthlyLimit
                        ? $"[{catBudget.Category}] {catBudget.Category} kategorisinde harcamanız ({spent:F2} {currency}), " +
                          $"belirlediğiniz limiti ({catBudget.MonthlyLimit:F2} {currency}) aştı."
                        : $"[{catBudget.Category}] {catBudget.Category} kategorisinde bütçenizin %{threshold}'ini kullandınız. " +
                          $"Harcama: {spent:F2} {currency} / Limit: {catBudget.MonthlyLimit:F2} {currency}.";

                    var catNotification = new NotificationQueue
                    {
                        UserId = userId,
                        UserSubscriptionId = null,
                        Title = title,
                        Message = message,
                        ScheduledDate = today,
                        IsSent = false,
                        Type = NotificationType.Budget,
                        CreatedDate = DateTime.UtcNow
                    };

                    await _queueRepo.AddAsync(catNotification);
                    _logger.LogInformation(
                        "Kategori bütçe uyarısı kuyruğa eklendi. UserId: {UserId}, Kategori: {Category}, Harcama: {Spent}",
                        userId, catBudget.Category, spent);
                }
            }

            await _unitOfWork.CommitAsync();
        }

        // --- #12 Kontrat sona erme hatırlatması ---
        public async Task CheckAndQueueContractExpiriesAsync(int daysBefore)
        {
            var trTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            var currentHour = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, trTimeZone).Hour;

            var targetDate = DateTime.UtcNow.Date.AddDays(daysBefore);
            var today = DateTime.UtcNow.Date;

            var expiringContracts = await _subscriptionRepo
                .Where(x => x.HasContract
                         && x.ContractEndDate.HasValue
                         && x.ContractEndDate.Value.Date == targetDate
                         && x.Status != SubscriptionStatus.Cancelled)
                .ToListAsync();

            if (!expiringContracts.Any()) return;

            foreach (var sub in expiringContracts)
            {
                // Kullanıcının belirlediği saatte değilse atla
                var subUser = await _userManager.FindByIdAsync(sub.UserId);
                if (subUser != null && subUser.NotifyHour != currentHour) continue;

                var alreadyQueued = await _queueRepo
                    .Where(x => x.UserId == sub.UserId
                             && x.UserSubscriptionId == sub.Id
                             && x.Type == NotificationType.Contract
                             && x.ScheduledDate >= today)
                    .AnyAsync();

                if (alreadyQueued) continue;

                var notification = new NotificationQueue
                {
                    UserId = sub.UserId,
                    UserSubscriptionId = sub.Id,
                    Title = "Sözleşme Sona Eriyor",
                    Message = $"{sub.Name} aboneliğinizin sözleşmesi {daysBefore} gün içinde " +
                              $"({sub.ContractEndDate!.Value:dd.MM.yyyy}) sona eriyor.",
                    ScheduledDate = today,
                    IsSent = false,
                    Type = NotificationType.Contract,
                    CreatedDate = DateTime.UtcNow
                };

                await _queueRepo.AddAsync(notification);
            }

            await _unitOfWork.CommitAsync();
        }

        // --- #13 Paylaşım bildirimi ---
        public async Task QueueShareNotificationAsync(
            string targetUserId, int subscriptionId, string subscriptionName, string ownerName)
        {
            var notification = new NotificationQueue
            {
                UserId = targetUserId,
                UserSubscriptionId = subscriptionId,
                Title = "Abonelik Paylaşıldı",
                Message = $"{ownerName} sizi '{subscriptionName}' aboneliğine ekledi.",
                ScheduledDate = DateTime.UtcNow.Date,
                IsSent = false,
                Type = NotificationType.Shared,
                CreatedDate = DateTime.UtcNow
            };

            await _queueRepo.AddAsync(notification);
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

        public async Task<CustomResponseDto<bool>> MarkAllAsReadAsync(string userId)
        {
            var unread = await _queueRepo
                .Where(x => x.UserId == userId && !x.IsRead)
                .ToListAsync();

            if (!unread.Any())
                return CustomResponseDto<bool>.Success(200, true);

            var now = DateTime.UtcNow;
            foreach (var n in unread)
            {
                n.IsRead = true;
                n.ReadDate = now;
                _queueRepo.Update(n);
            }

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

        // --- #14 Bildirim kuyruğu işleme — kanal bazlı hata izolasyonu ---
        public async Task ProcessNotificationQueueAsync()
        {
            var pending = await _queueRepo
                .ApplySpecification(new UnsentNotificationsSpec())
                .ToListAsync();

            if (!pending.Any()) return;

            int sent = 0;
            int failed = 0;
            var expiryThreshold = DateTime.UtcNow.AddDays(-7);

            foreach (var notification in pending)
            {
                // 7 günden eski gönderilmemiş bildirimleri süresi dolmuş say
                if (notification.ScheduledDate < expiryThreshold)
                {
                    notification.ErrorMessage = "Gönderim süresi doldu (7 gün).";
                    _queueRepo.Update(notification);
                    failed++;
                    continue;
                }

                var user = await _userManager.FindByIdAsync(notification.UserId);
                if (user == null) continue;

                UserSubscription? sub = null;
                if (notification.UserSubscriptionId.HasValue)
                    sub = await _subscriptionRepo.GetByIdAsync(notification.UserSubscriptionId.Value);

                int daysUntil = sub != null
                    ? Math.Max(0, (int)(notification.ScheduledDate.Date - DateTime.UtcNow.Date).TotalDays)
                    : 0;

                var htmlBody = notification.Type == NotificationType.Payment
                    ? EmailTemplates.PaymentReminder(
                        userName: user.FullName ?? user.Email!,
                        subscriptionName: sub?.Name ?? "Abonelik",
                        price: sub?.Price ?? 0,
                        currency: sub?.Currency ?? "",
                        daysUntil: daysUntil)
                    : $"<p>{notification.Message}</p>";

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

                bool anySent = false;

                // #14: Her kanal bağımsız — birinin hatası diğerini engellemiyor
                foreach (var sender in _senders)
                {
                    // Kullanıcı tercihleri kontrolü
                    if (sender.Channel == NotificationChannel.Email && !user.NotifEmailEnabled) continue;
                    if (sender.Channel == NotificationChannel.Push  && !user.NotifPushEnabled)  continue;
                    if (sender.Channel == NotificationChannel.Push  && string.IsNullOrEmpty(user.ExpoPushToken)) continue;

                    try
                    {
                        await sender.SendAsync(message);
                        anySent = true;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex,
                            "Bildirim kanalı başarısız. Kanal: {Channel}, NotificationId: {Id}",
                            sender.Channel, notification.Id);
                    }
                }

                if (anySent)
                {
                    notification.IsSent = true;
                    notification.SentDate = DateTime.UtcNow;
                    notification.ErrorMessage = null;
                    sent++;
                }
                else
                {
                    notification.ErrorMessage = "Hiçbir kanal üzerinden gönderilemedi.";
                    failed++;
                    _logger.LogError(
                        "Bildirim hiçbir kanaldan gönderilemedi. NotificationId: {Id}, UserId: {UserId}",
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

        public async Task<CustomResponseDto<NotificationPreferencesDto>> GetPreferencesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<NotificationPreferencesDto>.Fail(404, "Kullanıcı bulunamadı.");

            return CustomResponseDto<NotificationPreferencesDto>.Success(200, new NotificationPreferencesDto
            {
                PushEnabled = user.NotifPushEnabled,
                EmailEnabled = user.NotifEmailEnabled,
                ReminderDaysBefore = user.NotifReminderDays,
                NotifyHour = user.NotifyHour
            });
        }

        public async Task<CustomResponseDto<bool>> UpdatePreferencesAsync(string userId, NotificationPreferencesDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            if (dto.ReminderDaysBefore < 1 || dto.ReminderDaysBefore > 14)
                return CustomResponseDto<bool>.Fail(400, "Hatırlatma süresi 1-14 gün arasında olmalıdır.");

            if (dto.NotifyHour < 0 || dto.NotifyHour > 23)
                return CustomResponseDto<bool>.Fail(400, "Bildirim saati 0-23 arasında olmalıdır.");

            user.NotifPushEnabled = dto.PushEnabled;
            user.NotifEmailEnabled = dto.EmailEnabled;
            user.NotifReminderDays = dto.ReminderDaysBefore;
            user.NotifyHour = dto.NotifyHour;
            await _userManager.UpdateAsync(user);

            return CustomResponseDto<bool>.Success(200, true);
        }
    }
}
