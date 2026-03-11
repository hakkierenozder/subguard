namespace SubGuard.Core.DTOs
{
    public class UsageLogDto
    {
        public string Id { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? Note { get; set; }
        public decimal? Amount { get; set; }  // Opsiyonel: kullanım miktarı (saat, GB, vb.)
        public string? Unit { get; set; }      // Birim: "saat", "GB", "adet" vb.
    }

    public class AddUsageLogDto
    {
        public string? Note { get; set; }
        public decimal? Amount { get; set; }
        public string? Unit { get; set; }
    }
}
