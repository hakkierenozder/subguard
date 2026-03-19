namespace SubGuard.Core.DTOs
{
    public class SpendingReportDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        /// <summary>Para birimi → toplam harcama</summary>
        public Dictionary<string, decimal> TotalByCurrency { get; set; } = new();
        public List<SpendingLineDto> Lines { get; set; } = new();
    }

    public class SpendingLineDto
    {
        public int SubscriptionId { get; set; }
        public string Name { get; set; } = default!;
        public string Currency { get; set; } = default!;
        public decimal UnitPrice { get; set; }
        public int PaymentCount { get; set; }
        public decimal TotalAmount { get; set; }
        public string BillingPeriod { get; set; } = default!;
    }
}
