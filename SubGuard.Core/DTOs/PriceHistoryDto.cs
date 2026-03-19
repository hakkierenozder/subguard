namespace SubGuard.Core.DTOs
{
    public class PriceHistoryDto
    {
        public decimal OldPrice { get; set; }
        public decimal NewPrice { get; set; }
        public string Currency { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}
