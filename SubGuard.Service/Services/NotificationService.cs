using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
using SubGuard.Core.Helpers;
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
        private readonly ICurrencyService _currencyService;

        public NotificationService(
            IGenericRepository<UserSubscription> subscriptionRepo,
            IGenericRepository<NotificationQueue> queueRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnumerable<INotificationSender> senders,
            UserManager<AppUser> userManager,
            ILogger<NotificationService> logger,
            AppDbContext db,
            ICurrencyService currencyService)
        {
            _subscriptionRepo = subscriptionRepo;
            _queueRepo = queueRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _senders = senders;
            _userManager = userManager;
            _logger = logger;
            _db = db;
            _currencyService = currencyService;
        }

        // --- #15 Mükerrer korumalı ödeme hatırlatması ---
        // B-6: Her kullanıcının NotifReminderDays tercihini kullanır (hardcoded 3 yerine)
        // B-11: Batch sorgularla N+1 problemi çözüldü
        public async Task CheckAndQueueUpcomingPaymentsAsync()
        {
            var trTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            var currentHour = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, trTimeZone).Hour;
            var today = DateTime.UtcNow.Date;

            // Tüm aktif abonelikleri tek sorguda çek
            var allSubs = await _subscriptionRepo
                .Where(x => x.IsActive && x.Status != SubscriptionStatus.Cancelled)
                .ToListAsync();

            if (!allSubs.Any()) return;

            // İlgili kullanıcıları toplu çek (N+1 önlemi)
            var userIds = allSubs.Select(x => x.UserId).Distinct().ToList();
            var users = await _userManager.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            // Bugün için zaten kuyruğa alınmış ödeme bildirim sub ID'lerini toplu çek
            var subIds = allSubs.Select(x => x.Id).ToList();
            var alreadyQueuedSubIds = await _queueRepo
                .Where(x => x.UserSubscriptionId != null
                         && subIds.Contains(x.UserSubscriptionId!.Value)
                         && x.Type == NotificationType.Payment
                         && !x.IsSent
                         && x.ScheduledDate >= today)
                .Select(x => x.UserSubscriptionId!.Value)
                .ToListAsync();
            var alreadyQueuedSet = new HashSet<int>(alreadyQueuedSubIds);

            foreach (var sub in allSubs)
            {
                if (!users.TryGetValue(sub.UserId, out var subUser)) continue;
                if (subUser.NotifyHour != currentHour) continue;

                // Kullanıcının tercih ettiği hatırlatma günü
                var reminderDays = subUser.NotifReminderDays > 0 ? subUser.NotifReminderDays : 3;
                var targetDay = DateTime.UtcNow.AddDays(reminderDays).Day;

                if (sub.BillingDay != targetDay) continue;
                if (alreadyQueuedSet.Contains(sub.Id)) continue;

                var notification = new NotificationQueue
                {
                    UserId = sub.UserId,
                    UserSubscriptionId = sub.Id,
                    Title = "Ödeme Hatırlatması",
                    Message = $"{sub.Name} aboneliğinizin ödemesi {reminderDays} gün sonra. Tutar: {sub.Price} {sub.Currency}",
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
                .Where(u => u.MonthlyBudget > 0 && u.MonthlyBudgetCurrency != null && u.BudgetAlertEnabled) // F-10
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

                // B-9: Tüm para birimlerindeki abonelikleri hedef currency'ye çevirerek topla
                var subscriptions = await _subscriptionRepo
                    .Where(x => x.UserId == user.Id && x.Status == SubscriptionStatus.Active)
                    .Select(x => new { x.Price, x.Currency, x.BillingPeriod })
                    .ToListAsync();

                var rates = await _currencyService.GetRatesAsync();
                var totalMonthly = subscriptions.Sum(s =>
                    BillingPriceHelper.ConvertToTargetCurrency(
                        BillingPriceHelper.ToMonthlyEquivalent(s.Price, s.BillingPeriod),
                        s.Currency, user.MonthlyBudgetCurrency!, rates));

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
                if (user == null || user.MonthlyBudgetCurrency == null || !user.BudgetAlertEnabled) continue; // F-10

                var threshold = user.BudgetAlertThreshold > 0 ? user.BudgetAlertThreshold : 80;
                var currency = user.MonthlyBudgetCurrency;

                var catBudgets = await _db.CategoryBudgets
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .ToListAsync();

                // B-9: Tüm para birimlerindeki aktif abonelikleri çek
                var subs = await _subscriptionRepo
                    .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
                    .Select(s => new { s.Category, s.Price, s.Currency, s.BillingPeriod })
                    .ToListAsync();

                var catRates = await _currencyService.GetRatesAsync();
                var spendingByCategory = subs
                    .GroupBy(s => s.Category)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(s => BillingPriceHelper.ConvertToTargetCurrency(
                            BillingPriceHelper.ToMonthlyEquivalent(s.Price, s.BillingPeriod),
                            s.Currency, currency, catRates)));

                foreach (var catBudget in catBudgets)
                {
                    var spent = spendingByCategory.TryGetValue(catBudget.Category, out var s) ? s : 0m;
                    var limitThreshold = catBudget.MonthlyLimit * threshold / 100m;

                    if (spent < limitThreshold) continue;

                    // Bu ay bu kategori için zaten bildirim var mı?
                    // B-10: Fragile string search yerine CategoryBudget tipi + kategori prefix'i
                    var catAlreadyQueued = await _queueRepo
                        .Where(x => x.UserId == userId
                                 && x.Type == NotificationType.CategoryBudget
                                 && x.ScheduledDate >= startOfMonth
                                 && x.Message.StartsWith($"[{catBudget.Category}]"))
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
                        Type = NotificationType.CategoryBudget,
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
            // F-10: hedef kullanıcının paylaşım bildirimi tercihi
            var targetUser = await _userManager.FindByIdAsync(targetUserId);
            if (targetUser != null && !targetUser.SharedAlertEnabled) return;

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
            var query = _queueRepo.Where(x => x.UserId == userId && x.ScheduledDate <= DateTime.UtcNow.Date);
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
        // B-12: Kullanıcılar ve abonelikler batch çekiliyor (N+1 önlemi)
        public async Task ProcessNotificationQueueAsync()
        {
            var pending = await _queueRepo
                .ApplySpecification(new UnsentNotificationsSpec())
                .ToListAsync();

            if (!pending.Any()) return;

            int sent = 0;
            int failed = 0;
            var expiryThreshold = DateTime.UtcNow.AddDays(-7);

            // İlgili kullanıcıları toplu çek
            var pendingUserIds = pending.Select(n => n.UserId).Distinct().ToList();
            var usersDict = await _userManager.Users
                .Where(u => pendingUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            // İlgili abonelikleri toplu çek
            var pendingSubIds = pending
                .Where(n => n.UserSubscriptionId.HasValue)
                .Select(n => n.UserSubscriptionId!.Value)
                .Distinct()
                .ToList();
            var subsDict = (await _subscriptionRepo
                .Where(s => pendingSubIds.Contains(s.Id))
                .ToListAsync())
                .ToDictionary(s => s.Id);

            foreach (var notification in pending)
            {
                // 7 günden eski gönderilmemiş bildirimleri süresi dolmuş say
                if (notification.ScheduledDate < expiryThreshold)
                {
                    notification.IsSent = true; // UnsentNotificationsSpec'e tekrar düşmesin
                    notification.ErrorMessage = "Gönderim süresi doldu (7 gün).";
                    _queueRepo.Update(notification);
                    failed++;
                    continue;
                }

                if (!usersDict.TryGetValue(notification.UserId, out var user)) continue;

                UserSubscription? sub = null;
                if (notification.UserSubscriptionId.HasValue)
                    subsDict.TryGetValue(notification.UserSubscriptionId.Value, out sub);

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
                NotifyHour = user.NotifyHour,
                BudgetAlertEnabled = user.BudgetAlertEnabled,   // F-10
                SharedAlertEnabled = user.SharedAlertEnabled    // F-10
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
            user.BudgetAlertEnabled = dto.BudgetAlertEnabled;   // F-10
            user.SharedAlertEnabled = dto.SharedAlertEnabled;   // F-10
            await _userManager.UpdateAsync(user);

            return CustomResponseDto<bool>.Success(200, true);
        }
    }
}
