namespace SubGuard.Core.DTOs
{
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveSubscriptions { get; set; }
        public int TotalSubscriptions { get; set; }
        public List<CatalogStatDto> TopCatalogs { get; set; } = new();
        public int TotalCatalogs { get; set; }
        public List<CatalogStatDto> AllCatalogStats { get; set; } = new();
        public List<CategoryStatDto> CategoryDistribution { get; set; } = new();
    }

    public class CatalogStatDto
    {
        public string Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Category { get; set; }
        public int Count { get; set; }
    }

    public class CategoryStatDto
    {
        public string Category { get; set; }
        public int CatalogCount { get; set; }
        public int SubscriptionCount { get; set; }
    }
}
