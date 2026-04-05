namespace SubGuard.Core.Entities
{
    public class CategoryBudget : BaseEntity
    {
        public string UserId { get; set; }
        public string Category { get; set; }
        public decimal MonthlyLimit { get; set; }
        public string Currency { get; set; } = Constants.AppConstants.Currency.DefaultCode;
    }
}
