namespace SubGuard.Core.DTOs
{
    public class BudgetSettingsDto
    {
        public decimal? MonthlyBudget { get; set; }
        public string MonthlyBudgetCurrency { get; set; } = "TRY";
    }
}
