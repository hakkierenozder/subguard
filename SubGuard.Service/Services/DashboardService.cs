using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
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

            var totalByCurrency = await baseQuery
                .GroupBy(x => x.Currency)
                .Select(g => new CurrencyTotalDto
                {
                    Currency = g.Key,
                    Total = g.Sum(x => x.Price)
                })
                .OrderByDescending(x => x.Total)
                .ToListAsync();

            var spendingByCategory = await baseQuery
                .GroupBy(x => new { x.Category, x.Currency })
                .Select(g => new CategorySpendingDto
                {
                    Category = g.Key.Category,
                    Currency = g.Key.Currency,
                    Total = g.Sum(x => x.Price),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ToListAsync();

            // UpcomingPayments: BillingDay hesabı uygulama katmanında yapılıyor,
            // ancak yalnızca gerekli alanlar DB'den çekiliyor (Catalog join yok)
            var paymentProjections = await baseQuery
                .Select(x => new SubscriptionPaymentData(
                    x.Id, x.Name, x.Price, x.Currency, x.BillingDay, x.ColorCode))
                .ToListAsync();

            var today = DateTime.UtcNow;
            var upcomingPayments = CalcUpcomingPayments(paymentProjections, today, upcomingDays);

            var budgetSummary = await CalcBudgetSummaryAsync(userId, baseQuery);

            var dashboard = new DashboardDto
            {
                ActiveSubscriptionCount = activeCount,
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
                .Select(x => new { x.Price, x.Currency })
                .ToListAsync();

            var totalSpent = allSubs.Sum(x =>
                ConvertToTargetCurrency(x.Price, x.Currency, user.MonthlyBudgetCurrency, rates));

            return new BudgetSummaryDto
            {
                MonthlyBudget = user.MonthlyBudget,
                Currency = user.MonthlyBudgetCurrency,
                TotalSpent = Math.Round(totalSpent, 2)
            };
        }

        // Frankfurter API kurları EUR bazlıdır: 1 EUR = rates[X] X birimi
        private static decimal ConvertToTargetCurrency(
            decimal amount, string fromCurrency, string toCurrency,
            Dictionary<string, decimal> rates)
        {
            if (fromCurrency == toCurrency) return amount;

            decimal fromRate = fromCurrency == "EUR" ? 1m : rates.GetValueOrDefault(fromCurrency, 0m);
            decimal toRate = toCurrency == "EUR" ? 1m : rates.GetValueOrDefault(toCurrency, 0m);

            if (fromRate == 0) return 0; // Bilinmeyen kaynak para birimi

            // Önce EUR'ya çevir, sonra hedef para birimine
            return amount / fromRate * toRate;
        }

        private static List<UpcomingPaymentDto> CalcUpcomingPayments(
            IEnumerable<SubscriptionPaymentData> subs, DateTime today, int upcomingDays)
        {
            var result = new List<UpcomingPaymentDto>();
            var todayDate = today.Date;

            foreach (var sub in subs)
            {
                // Bir sonraki fatura tarihini hesapla — yıl/ay geçişlerini doğru ele alır
                int clampedThisMonth = Math.Min(sub.BillingDay, DateTime.DaysInMonth(todayDate.Year, todayDate.Month));
                DateTime nextBilling;

                if (clampedThisMonth >= todayDate.Day)
                {
                    // Bu ay içinde
                    nextBilling = new DateTime(todayDate.Year, todayDate.Month, clampedThisMonth);
                }
                else
                {
                    // Sonraki ay (Aralık → Ocak yıl geçişi dahil)
                    int nextMonth = todayDate.Month == 12 ? 1 : todayDate.Month + 1;
                    int nextYear = todayDate.Month == 12 ? todayDate.Year + 1 : todayDate.Year;
                    int clampedNextMonth = Math.Min(sub.BillingDay, DateTime.DaysInMonth(nextYear, nextMonth));
                    nextBilling = new DateTime(nextYear, nextMonth, clampedNextMonth);
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
                        ColorCode = sub.ColorCode
                    });
                }
            }

            return result.OrderBy(x => x.DaysUntilPayment).ToList();
        }

        // Yalnızca UpcomingPayments hesabı için gerekli alanları taşır
        private record SubscriptionPaymentData(
            int Id, string Name, decimal Price, string Currency, int BillingDay, string? ColorCode);
    }
}
