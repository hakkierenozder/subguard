using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
using SubGuard.Core.Helpers;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IGenericRepository<UserSubscription> _repo;
        private readonly UserManager<AppUser> _userManager;
        private readonly ICurrencyService _currencyService;

        public DashboardService(
            IGenericRepository<UserSubscription> repo,
            UserManager<AppUser> userManager,
            ICurrencyService currencyService)
        {
            _repo = repo;
            _userManager = userManager;
            _currencyService = currencyService;
        }

        public async Task<CustomResponseDto<DashboardDto>> GetDashboardAsync(string userId, int upcomingDays = 30)
        {
            var baseQuery = _repo.Where(x => x.UserId == userId && x.IsActive);
            var today = DateTime.UtcNow.Date;

            // Tüm aggregation'lar DB'de yapılıyor — RAM'e tam liste yüklenmiyor

            // Pasif abonelik sayıları (IsActive false olanlar)
            var inactiveQuery = _repo.Where(x => x.UserId == userId && !x.IsActive);
            var pausedCount    = await inactiveQuery.CountAsync(x => x.Status == SubscriptionStatus.Paused);
            var cancelledCount = await inactiveQuery.CountAsync(x => x.Status == SubscriptionStatus.Cancelled);

            // Tüm abonelik verilerini tek sorguda çek — aggregation'lar in-memory yapılıyor
            // (ToMonthlyEquivalent SQL'e çevrilemiyor, BillingPeriod'a göre hesap gerekiyor)
            var allSubData = await baseQuery
                .Select(x => new
                {
                    x.Id, x.Name, x.Price, x.Currency, x.BillingDay,
                    x.ColorCode, x.BillingPeriod, x.Category,
                    // B-2: BillingMonth eklendi — yıllık ödeme ayı doğru anchor'lanıyor
                    x.BillingMonth, x.CreatedDate, x.FirstPaymentDate, x.ContractStartDate, x.Notes,
                    ShareCount = x.Shares.Count(share => !share.IsDeleted)
                })
                .ToListAsync();

            var startedSubs = allSubData
                .Where(x => SubscriptionBillingHelper.HasStarted(
                    x.CreatedDate,
                    x.FirstPaymentDate,
                    x.ContractStartDate,
                    today))
                .ToList();

            var pendingSubs = allSubData
                .Where(x => !SubscriptionBillingHelper.HasStarted(
                    x.CreatedDate,
                    x.FirstPaymentDate,
                    x.ContractStartDate,
                    today))
                .ToList();

            var totalByCurrency = startedSubs
                .GroupBy(x => x.Currency)
                .Select(g => new CurrencyTotalDto
                {
                    Currency = g.Key,
                    Total = g.Sum(x => BillingPriceHelper.ApplyUserShare(
                        BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                        x.ShareCount))
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            var spendingByCategory = startedSubs
                .GroupBy(x => new { x.Category, x.Currency })
                .Select(g => new CategorySpendingDto
                {
                    Category = g.Key.Category,
                    Currency = g.Key.Currency,
                    Total = g.Sum(x => BillingPriceHelper.ApplyUserShare(
                        BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                        x.ShareCount)),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            // UpcomingPayments: BillingPeriod dahil, uygulama katmanında hesaplanıyor
            var paymentProjections = allSubData
                .Select(x => new SubscriptionPaymentData(
                    x.Id, x.Name, x.Price, x.Currency, x.BillingDay, x.ColorCode,
                    x.BillingPeriod, x.BillingMonth, x.CreatedDate, x.FirstPaymentDate, x.ContractStartDate, x.Notes))
                .ToList();

            var upcomingPayments = CalcUpcomingPayments(paymentProjections, today, upcomingDays);

            var budgetCalcItems = startedSubs
                .Select(x => new BudgetCalcItem(x.Price, x.Currency, x.BillingPeriod, x.ShareCount))
                .ToList();

            var budgetSummary = await CalcBudgetSummaryAsync(userId, budgetCalcItems);

            var dashboard = new DashboardDto
            {
                ActiveSubscriptionCount = startedSubs.Count,
                PendingSubscriptionCount = pendingSubs.Count,
                PausedCount    = pausedCount,
                CancelledCount = cancelledCount,
                StartedMonthlyEquivalentTotal = startedSubs.Sum(x => BillingPriceHelper.ApplyUserShare(
                    BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                    x.ShareCount)),
                PendingMonthlyEquivalentTotal = pendingSubs.Sum(x => BillingPriceHelper.ApplyUserShare(
                    BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                    x.ShareCount)),
                TotalByCurrency = totalByCurrency,
                SpendingByCategory = spendingByCategory,
                UpcomingPayments = upcomingPayments,
                BudgetSummary = budgetSummary
            };

            return CustomResponseDto<DashboardDto>.Success(200, dashboard);
        }

        private async Task<BudgetSummaryDto?> CalcBudgetSummaryAsync(
            string userId,
            IEnumerable<BudgetCalcItem> preloadedSubs)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null || user.MonthlyBudget <= 0 || string.IsNullOrEmpty(user.MonthlyBudgetCurrency))
                return null;

            // Kur bilgilerini cache'den çek
            var rates = await _currencyService.GetRatesAsync();

            // allSubData zaten GetDashboardAsync içinde çekildi — ikinci DB sorgusu yok
            var totalSpent = preloadedSubs.Sum(x =>
                BillingPriceHelper.ConvertToTargetCurrency(
                    BillingPriceHelper.ApplyUserShare(
                        BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                        x.ShareCount),
                    x.Currency, user.MonthlyBudgetCurrency, rates));

            var roundedTotalSpent = Math.Round(totalSpent, 2);
            var threshold = user.BudgetAlertThreshold > 0 ? user.BudgetAlertThreshold : 80;
            var thresholdAmount = user.MonthlyBudget * threshold / 100m;

            return new BudgetSummaryDto
            {
                MonthlyBudget = user.MonthlyBudget,
                Currency = user.MonthlyBudgetCurrency,
                TotalSpent = roundedTotalSpent,
                BudgetAlertThreshold = threshold,
                IsNearLimit = roundedTotalSpent >= thresholdAmount && roundedTotalSpent <= user.MonthlyBudget
            };
        }

        private static List<UpcomingPaymentDto> CalcUpcomingPayments(
            IEnumerable<SubscriptionPaymentData> subs, DateTime today, int upcomingDays)
        {
            var result = new List<UpcomingPaymentDto>();
            var todayDate = today.Date;

            foreach (var sub in subs)
            {
                var nextBilling = SubscriptionBillingHelper.GetNextBillingDate(
                    sub.BillingPeriod,
                    sub.BillingDay,
                    sub.BillingMonth,
                    sub.CreatedDate,
                    sub.FirstPaymentDate,
                    sub.ContractStartDate,
                    todayDate);

                int daysUntil = (int)(nextBilling - todayDate).TotalDays;

                if (daysUntil <= upcomingDays)
                {
                    result.Add(new UpcomingPaymentDto
                    {
                        Id = sub.Id,
                        Name = sub.Name,
                        Price = sub.Price,
                        Currency = sub.Currency,
                        BillingDay = sub.BillingDay,
                        DaysUntilPayment = daysUntil,
                        ColorCode = sub.ColorCode,
                        BillingPeriod = sub.BillingPeriod,
                        Notes = sub.Notes
                    });
                }
            }

            return result.OrderBy(x => x.DaysUntilPayment).ToList();
        }

        // Bütçe hesabı için minimal projeksiyon — GetDashboardAsync'den geçirilir, ikinci DB sorgusu önlenir
        private record BudgetCalcItem(decimal Price, string Currency, BillingPeriod BillingPeriod, int ShareCount);

        // UpcomingPayments hesabı için gerekli alanları taşır
        private record SubscriptionPaymentData(
            int Id, string Name, decimal Price, string Currency, int BillingDay, string? ColorCode,
            BillingPeriod BillingPeriod, int? BillingMonth, DateTime CreatedDate, DateTime? FirstPaymentDate, DateTime? ContractStartDate, string? Notes);
    }
}
