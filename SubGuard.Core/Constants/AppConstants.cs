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
        }
    }
}
