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

            // Tüm aggregation'lar DB'de yapılıyor — RAM'e tam liste yüklenmiyor

            var activeCount = await baseQuery.CountAsync();

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
                    x.CreatedDate, x.ContractStartDate, x.Notes
                })
                .ToListAsync();

            var totalByCurrency = allSubData
                .GroupBy(x => x.Currency)
                .Select(g => new CurrencyTotalDto
                {
                    Currency = g.Key,
                    Total = g.Sum(x => BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod))
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            var spendingByCategory = allSubData
                .GroupBy(x => new { x.Category, x.Currency })
                .Select(g => new CategorySpendingDto
                {
                    Category = g.Key.Category,
                    Currency = g.Key.Currency,
                    Total = g.Sum(x => BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod)),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            // UpcomingPayments: BillingPeriod dahil, uygulama katmanında hesaplanıyor
            var paymentProjections = allSubData
                .Select(x => new SubscriptionPaymentData(
                    x.Id, x.Name, x.Price, x.Currency, x.BillingDay, x.ColorCode,
                    x.BillingPeriod, x.CreatedDate, x.ContractStartDate, x.Notes))
                .ToList();

            var today = DateTime.UtcNow;
            var upcomingPayments = CalcUpcomingPayments(paymentProjections, today, upcomingDays);

            var budgetSummary = await CalcBudgetSummaryAsync(userId, baseQuery);

            var dashboard = new DashboardDto
            {
                ActiveSubscriptionCount = activeCount,
                PausedCount    = pausedCount,
                CancelledCount = cancelledCount,
                TotalByCurrency = totalByCurrency,
                SpendingByCategory = spendingByCategory,
                UpcomingPayments = upcomingPayments,
                BudgetSummary = budgetSummary
            };

            return CustomResponseDto<DashboardDto>.Success(200, dashboard);
        }

        private async Task<BudgetSummaryDto?> CalcBudgetSummaryAsync(
            string userId, IQueryable<UserSubscription> baseQuery)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null || user.MonthlyBudget <= 0 || string.IsNullOrEmpty(user.MonthlyBudgetCurrency))
                return null;

            // Kur bilgilerini cache'den çek
            var rates = await _currencyService.GetRatesAsync();

            // Tüm abonelik fiyatlarını bütçe para birimine çevirerek topla
            var allSubs = await baseQuery
                .Select(x => new { x.Price, x.Currency, x.BillingPeriod })
                .ToListAsync();

            var totalSpent = allSubs.Sum(x =>
                BillingPriceHelper.ConvertToTargetCurrency(
                    BillingPriceHelper.ToMonthlyEquivalent(x.Price, x.BillingPeriod),
                    x.Currency, user.MonthlyBudgetCurrency, rates));

            return new BudgetSummaryDto
            {
                MonthlyBudget = user.MonthlyBudget,
                Currency = user.MonthlyBudgetCurrency,
                TotalSpent = Math.Round(totalSpent, 2)
            };
        }

        private static List<UpcomingPaymentDto> CalcUpcomingPayments(
            IEnumerable<SubscriptionPaymentData> subs, DateTime today, int upcomingDays)
        {
            var result = new List<UpcomingPaymentDto>();
            var todayDate = today.Date;

            foreach (var sub in subs)
            {
                DateTime nextBilling;

                if (sub.BillingPeriod == BillingPeriod.Yearly)
                {
                    // Yıllık abonelik: ödeme ayını ContractStartDate'den yoksa CreatedDate'den çıkar
                    var billingMonth = sub.ContractStartDate?.Month ?? sub.CreatedDate.Month;

                    var thisYearDate = new DateTime(
                        todayDate.Year, billingMonth,
                        Math.Min(sub.BillingDay, DateTime.DaysInMonth(todayDate.Year, billingMonth)));

                    if (thisYearDate >= todayDate)
                    {
                        nextBilling = thisYearDate;
                    }
                    else
                    {
                        int nextYear = todayDate.Year + 1;
                        nextBilling = new DateTime(
                            nextYear, billingMonth,
                            Math.Min(sub.BillingDay, DateTime.DaysInMonth(nextYear, billingMonth)));
                    }
                }
                else
                {
                    // Aylık abonelik: bir sonraki BillingDay tarihini hesapla
                    int clampedThisMonth = Math.Min(sub.BillingDay, DateTime.DaysInMonth(todayDate.Year, todayDate.Month));

                    if (clampedThisMonth >= todayDate.Day)
                    {
                        nextBilling = new DateTime(todayDate.Year, todayDate.Month, clampedThisMonth);
                    }
                    else
                    {
                        int nextMonth = todayDate.Month == 12 ? 1 : todayDate.Month + 1;
                        int nextYear  = todayDate.Month == 12 ? todayDate.Year + 1 : todayDate.Year;
                        int clampedNextMonth = Math.Min(sub.BillingDay, DateTime.DaysInMonth(nextYear, nextMonth));
                        nextBilling = new DateTime(nextYear, nextMonth, clampedNextMonth);
                    }
                }

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

        // UpcomingPayments hesabı için gerekli alanları taşır
        private record SubscriptionPaymentData(
            int Id, string Name, decimal Price, string Currency, int BillingDay, string? ColorCode,
            BillingPeriod BillingPeriod, DateTime CreatedDate, DateTime? ContractStartDate, string? Notes);
    }
}
