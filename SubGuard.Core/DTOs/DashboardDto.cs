using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    public class DashboardDto
    {
        public int ActiveSubscriptionCount { get; set; }
        public int PendingSubscriptionCount { get; set; }
        public int PausedCount { get; set; }
        public int CancelledCount { get; set; }
        public decimal StartedMonthlyEquivalentTotal { get; set; }
        public decimal PendingMonthlyEquivalentTotal { get; set; }
        public List<CurrencyTotalDto> TotalByCurrency { get; set; }
        public List<CategorySpendingDto> SpendingByCategory { get; set; }
        public List<UpcomingPaymentDto> UpcomingPayments { get; set; }
        public BudgetSummaryDto? BudgetSummary { get; set; }
    }

    public class BudgetSummaryDto
    {
        public decimal MonthlyBudget { get; set; }
        public string Currency { get; set; }
        public decimal TotalSpent { get; set; }
        public int BudgetAlertThreshold { get; set; }
        public bool IsNearLimit { get; set; }
        public decimal Remaining => MonthlyBudget - TotalSpent;
        public bool IsOverBudget => TotalSpent > MonthlyBudget;
        public decimal OverAmount => IsOverBudget ? TotalSpent - MonthlyBudget : 0;
    }

    public class CurrencyTotalDto
    {
        public string Currency { get; set; }
        public decimal Total { get; set; }
    }

    public class CategorySpendingDto
    {
        public string Category { get; set; }
        public string Currency { get; set; }
        public decimal Total { get; set; }
        public int Count { get; set; }
    }

    public class UpcomingPaymentDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingDay { get; set; }
        public int DaysUntilPayment { get; set; }
        public string? ColorCode { get; set; }
        public BillingPeriod BillingPeriod { get; set; }
        public string? Notes { get; set; }
    }
}
