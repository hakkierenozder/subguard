namespace SubGuard.Core.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public decimal? MonthlyBudget { get; set; }
        public string? MonthlyBudgetCurrency { get; set; }
        /// <summary>Bütçe uyarı eşiği (0-100). null ise güncellenmez.</summary>
        public int? BudgetAlertThreshold { get; set; }
    }
}
