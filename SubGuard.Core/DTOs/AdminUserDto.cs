namespace SubGuard.Core.DTOs
{
    public class AdminUserDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        /// <summary>LockoutEnd null veya geçmişte → aktif; DateTimeOffset.MaxValue ise askıya alınmış.</summary>
        public bool IsActive { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime CreatedDate { get; set; }
        public int SubscriptionCount { get; set; }
    }
}
