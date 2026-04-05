namespace SubGuard.Core.Constants
{
    public static class AppConstants
    {
        public static class Token
        {
            public const int AccessTokenExpirationMinutes = 15;
            public const int RefreshTokenExpirationDays = 30;
        }

        public static class Cache
        {
            public const int CurrencyRatesExpirationHours = 24;
            public const int CatalogExpirationHours = 24;
            public const int MaxCatalogItems = 5000;
        }

        public static class Subscription
        {
            public const string DefaultColorCode = "#333333";
        }

        public static class Currency
        {
            // Frankfurter API erişilemezse kullanılacak fallback kurlar (TRY cinsinden)
            public const decimal FallbackUsd = 34.50m;
            public const decimal FallbackEur = 37.20m;
            public const decimal FallbackGbp = 43.10m;
            public const string DefaultCode = "TRY";

            public static readonly string[] SupportedCodes = new[] { "TRY", "USD", "EUR", "GBP" };

            public static bool IsSupported(string? code) =>
                !string.IsNullOrWhiteSpace(code)
                && SupportedCodes.Contains(code.Trim().ToUpperInvariant());

            public static string NormalizeOrDefault(string? code)
            {
                var normalized = code?.Trim().ToUpperInvariant();
                return IsSupported(normalized) ? normalized! : DefaultCode;
            }
        }

        public static class TimeZones
        {
            // Windows: "Turkey Standard Time", Linux/Docker: "Europe/Istanbul"
            // RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ile seçim yapmak yerine
            // her ikisini de dene — bu şekilde cross-platform çalışır.
            public const string TurkeyWindows = "Turkey Standard Time";
            public const string TurkeyIana    = "Europe/Istanbul";

            /// <summary>Türkiye saat dilimini döndürür. Cross-platform (Windows + Linux/Docker).</summary>
            public static TimeZoneInfo Turkey =>
                TimeZoneInfo.GetSystemTimeZones()
                    .FirstOrDefault(tz => tz.Id == TurkeyWindows || tz.Id == TurkeyIana)
                ?? TimeZoneInfo.Utc;
        }
    }
}
