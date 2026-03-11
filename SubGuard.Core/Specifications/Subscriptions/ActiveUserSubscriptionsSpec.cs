using SubGuard.Core.Entities;

namespace SubGuard.Core.Specifications.Subscriptions
{
    /// <summary>Belirli bir kullanıcının aktif (silinmemiş) aboneliklerini döner.</summary>
    public class ActiveUserSubscriptionsSpec : BaseSpecification<UserSubscription>
    {
        public ActiveUserSubscriptionsSpec(string userId)
            : base(x => x.UserId == userId && x.IsActive && !x.IsDeleted)
        {
            ApplyOrderByDescending(x => x.CreatedDate);
        }
    }
}
