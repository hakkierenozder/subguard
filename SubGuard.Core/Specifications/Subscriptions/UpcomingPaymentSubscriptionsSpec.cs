using SubGuard.Core.Entities;

namespace SubGuard.Core.Specifications.Subscriptions
{
    /// <summary>
    /// Belirtilen fatura günü (billingDay) ile eşleşen,
    /// aktif ve silinmemiş abonelikleri döner.
    /// NotificationService.CheckAndQueueUpcomingPaymentsAsync tarafından kullanılır.
    /// </summary>
    public class UpcomingPaymentSubscriptionsSpec : BaseSpecification<UserSubscription>
    {
        public UpcomingPaymentSubscriptionsSpec(int billingDay)
            : base(x => x.IsActive && !x.IsDeleted && x.BillingDay == billingDay)
        {
        }
    }
}
