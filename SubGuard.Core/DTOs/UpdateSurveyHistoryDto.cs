namespace SubGuard.Core.DTOs
{
    /// <summary>
    /// Kullanım anketi (survey) geçmişini senkronize etmek için kullanılan payload.
    /// Yalnızca UsageHistoryJson alanını günceller; abonelik verileri değişmez.
    /// </summary>
    public class UpdateSurveyHistoryDto
    {
        public string UsageHistoryJson { get; set; }
    }
}
