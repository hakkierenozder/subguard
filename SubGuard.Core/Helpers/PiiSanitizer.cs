namespace SubGuard.Core.Helpers
{
    public static class PiiSanitizer
    {
        /// <summary>
        /// E-posta adresini maskeler: "hakki@example.com" → "ha***@example.com"
        /// </summary>
        public static string MaskEmail(string? email)
        {
            if (string.IsNullOrEmpty(email)) return "(boş)";
            var atIndex = email.IndexOf('@');
            if (atIndex <= 0) return "***";
            var user = email[..atIndex];
            var domain = email[atIndex..];
            var visible = user.Length <= 2 ? user : user[..2];
            return $"{visible}***{domain}";
        }
    }
}
