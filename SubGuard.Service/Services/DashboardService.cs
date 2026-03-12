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

        public DashboardService(IGenericRepository<UserSubscription> repo, UserManager<AppUser> userManager)
        {
            _repo = repo;
            _userManager = userManager;
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

            // SUM DB'de hesaplanıyor
            var totalSpent = await baseQuery
                .Where(x => x.Currency == user.MonthlyBudgetCurrency)
                .SumAsync(x => x.Price);

            return new BudgetSummaryDto
            {
                MonthlyBudget = user.MonthlyBudget,
                Currency = user.MonthlyBudgetCurrency,
                TotalSpent = totalSpent
            };
        }

        private static List<UpcomingPaymentDto> CalcUpcomingPayments(
            IEnumerable<SubscriptionPaymentData> subs, DateTime today, int upcomingDays)
        {
            var result = new List<UpcomingPaymentDto>();
            int daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);

            foreach (var sub in subs)
            {
                int billingDay = Math.Min(sub.BillingDay, daysInMonth);
                int daysUntil = billingDay >= today.Day
                    ? billingDay - today.Day
                    : (daysInMonth - today.Day) + billingDay;

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
