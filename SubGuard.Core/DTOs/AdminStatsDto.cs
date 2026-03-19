namespace SubGuard.Core.DTOs
{
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveSubscriptions { get; set; }
        public int TotalSubscriptions { get; set; }
        public List<CatalogStatDto> TopCatalogs { get; set; } = new();
    }

    public class CatalogStatDto
    {
        public string Name { get; set; }
        public string? LogoUrl { get; set; }
        public int Count { get; set; }
    }
}
