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
            var subscriptions = await _repo
                .Where(x => x.UserId == userId && x.IsActive)
                .ToListAsync();

            var today = DateTime.UtcNow;

            var dashboard = new DashboardDto
            {
                ActiveSubscriptionCount = subscriptions.Count,
                TotalByCurrency = CalcTotalByCurrency(subscriptions),
                SpendingByCategory = CalcSpendingByCategory(subscriptions),
                UpcomingPayments = CalcUpcomingPayments(subscriptions, today, upcomingDays),
                BudgetSummary = await CalcBudgetSummaryAsync(userId, subscriptions)
            };

            return CustomResponseDto<DashboardDto>.Success(200, dashboard);
        }

        private async Task<BudgetSummaryDto?> CalcBudgetSummaryAsync(string userId, List<UserSubscription> subs)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null || user.MonthlyBudget <= 0 || string.IsNullOrEmpty(user.MonthlyBudgetCurrency))
                return null;

            var totalSpent = subs
                .Where(x => x.Currency == user.MonthlyBudgetCurrency)
                .Sum(x => x.Price);

            return new BudgetSummaryDto
            {
                MonthlyBudget = user.MonthlyBudget,
                Currency = user.MonthlyBudgetCurrency,
                TotalSpent = totalSpent
            };
        }

        private static List<CurrencyTotalDto> CalcTotalByCurrency(List<UserSubscription> subs) =>
            subs.GroupBy(x => x.Currency)
                .Select(g => new CurrencyTotalDto
                {
                    Currency = g.Key,
                    Total = g.Sum(x => x.Price)
                })
                .OrderByDescending(x => x.Total)
                .ToList();

        private static List<CategorySpendingDto> CalcSpendingByCategory(List<UserSubscription> subs) =>
            subs.GroupBy(x => new { x.Category, x.Currency })
                .Select(g => new CategorySpendingDto
                {
                    Category = g.Key.Category,
                    Currency = g.Key.Currency,
                    Total = g.Sum(x => x.Price),
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .ToList();

        private static List<UpcomingPaymentDto> CalcUpcomingPayments(
            List<UserSubscription> subs, DateTime today, int upcomingDays)
        {
            var result = new List<UpcomingPaymentDto>();
            int daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);

            foreach (var sub in subs)
            {
                int billingDay = Math.Min(sub.BillingDay, daysInMonth);
                int daysUntil;

                if (billingDay >= today.Day)
                    daysUntil = billingDay - today.Day;
                else
                    daysUntil = (daysInMonth - today.Day) + billingDay;

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
    }
}
