namespace SubGuard.Core.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public decimal? MonthlyBudget { get; set; }
        public string? MonthlyBudgetCurrency { get; set; }
    }
}
