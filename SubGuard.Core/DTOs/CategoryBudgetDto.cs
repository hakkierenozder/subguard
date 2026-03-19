using System.ComponentModel.DataAnnotations;

namespace SubGuard.Core.DTOs
{
    // GET /api/budget/categories yanıtı — runtime hesaplanmış spent dahil
    public class CategoryBudgetDto
    {
        public string Category { get; set; }
        public decimal MonthlyLimit { get; set; }
        public decimal Spent { get; set; }
        public string Currency { get; set; }      // kullanıcının global MonthlyBudgetCurrency'si
        public decimal Remaining => MonthlyLimit - Spent;
        public bool IsOverBudget => Spent > MonthlyLimit;
        public bool IsNearLimit { get; set; }     // Spent >= MonthlyLimit * threshold / 100
    }

    // PUT /api/budget/categories request body
    public class UpsertCategoryBudgetDto
    {
        [Required]
        public string Category { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Limit 0'dan büyük olmalıdır.")]
        public decimal MonthlyLimit { get; set; }
    }
}
