namespace SubGuard.Core.DTOs.Auth
{
    public class UserProfileDto
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public int TotalSubscriptions { get; set; }
        public decimal MonthlyBudget { get; set; }
        public string? MonthlyBudgetCurrency { get; set; }
        public int BudgetAlertThreshold { get; set; }
        public bool BudgetAlertEnabled { get; set; }
        public bool SharedAlertEnabled { get; set; }
        public bool IsAdmin { get; set; }
    }
}
