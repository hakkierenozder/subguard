using SubGuard.Core.Entities;
using SubGuard.Core.Enums;

namespace SubGuard.Core.Helpers
{
    public static class SubscriptionBillingHelper
    {
        public static DateTime GetEffectiveFirstPaymentDate(UserSubscription subscription) =>
            GetEffectiveFirstPaymentDate(subscription.CreatedDate, subscription.FirstPaymentDate, subscription.ContractStartDate);

        public static DateTime GetEffectiveFirstPaymentDate(
            DateTime createdDate,
            DateTime? firstPaymentDate,
            DateTime? contractStartDate)
        {
            return (firstPaymentDate ?? contractStartDate ?? createdDate).Date;
        }

        public static bool HasStarted(UserSubscription subscription, DateTime referenceDate) =>
            HasStarted(subscription.CreatedDate, subscription.FirstPaymentDate, subscription.ContractStartDate, referenceDate);

        public static bool HasStarted(
            DateTime createdDate,
            DateTime? firstPaymentDate,
            DateTime? contractStartDate,
            DateTime referenceDate)
        {
            return GetEffectiveFirstPaymentDate(createdDate, firstPaymentDate, contractStartDate) <= referenceDate.Date;
        }

        public static DateTime GetNextBillingDate(UserSubscription subscription, DateTime referenceDate) =>
            GetNextBillingDate(
                subscription.BillingPeriod,
                subscription.BillingDay,
                subscription.BillingMonth,
                subscription.CreatedDate,
                subscription.FirstPaymentDate,
                subscription.ContractStartDate,
                referenceDate);

        public static DateTime GetNextBillingDate(
            BillingPeriod billingPeriod,
            int billingDay,
            int? billingMonth,
            DateTime createdDate,
            DateTime? firstPaymentDate,
            DateTime? contractStartDate,
            DateTime referenceDate)
        {
            var reference = referenceDate.Date;
            var firstPayment = GetEffectiveFirstPaymentDate(createdDate, firstPaymentDate, contractStartDate);

            if (firstPayment > reference)
                return firstPayment;

            return billingPeriod == BillingPeriod.Yearly
                ? GetNextYearlyBillingDate(reference, firstPayment, billingDay, billingMonth)
                : GetNextMonthlyBillingDate(reference, firstPayment, billingDay);
        }

        public static int CountPaymentsInRange(UserSubscription subscription, DateTime from, DateTime to) =>
            CountPaymentsInRange(
                subscription.BillingPeriod,
                subscription.BillingDay,
                subscription.BillingMonth,
                subscription.CreatedDate,
                subscription.FirstPaymentDate,
                subscription.ContractStartDate,
                from,
                to);

        public static int CountPaymentsInRange(
            BillingPeriod billingPeriod,
            int billingDay,
            int? billingMonth,
            DateTime createdDate,
            DateTime? firstPaymentDate,
            DateTime? contractStartDate,
            DateTime from,
            DateTime to)
        {
            var firstPayment = GetEffectiveFirstPaymentDate(createdDate, firstPaymentDate, contractStartDate);
            var effectiveFrom = from.Date > firstPayment ? from.Date : firstPayment;

            if (effectiveFrom > to.Date)
                return 0;

            var cursor = GetNextBillingDate(
                billingPeriod,
                billingDay,
                billingMonth,
                createdDate,
                firstPaymentDate,
                contractStartDate,
                effectiveFrom);

            var count = 0;
            while (cursor <= to.Date)
            {
                count++;
                cursor = Advance(cursor, billingPeriod, billingDay, billingMonth);
            }

            return count;
        }

        public static DateTime? GetAccessUntilDateOnCancel(UserSubscription subscription, DateTime cancellationDate) =>
            GetAccessUntilDateOnCancel(
                subscription.BillingPeriod,
                subscription.BillingDay,
                subscription.BillingMonth,
                subscription.CreatedDate,
                subscription.FirstPaymentDate,
                subscription.ContractStartDate,
                cancellationDate);

        public static DateTime? GetAccessUntilDateOnCancel(
            BillingPeriod billingPeriod,
            int billingDay,
            int? billingMonth,
            DateTime createdDate,
            DateTime? firstPaymentDate,
            DateTime? contractStartDate,
            DateTime cancellationDate)
        {
            var cancellationDay = cancellationDate.Date;

            if (!HasStarted(createdDate, firstPaymentDate, contractStartDate, cancellationDay))
                return null;

            var accessUntil = GetNextBillingDate(
                billingPeriod,
                billingDay,
                billingMonth,
                createdDate,
                firstPaymentDate,
                contractStartDate,
                cancellationDay);

            if (accessUntil <= cancellationDay)
                accessUntil = Advance(accessUntil, billingPeriod, billingDay, billingMonth);

            return accessUntil.Date;
        }

        private static DateTime GetNextMonthlyBillingDate(DateTime reference, DateTime firstPayment, int billingDay)
        {
            var monthCursor = new DateTime(reference.Year, reference.Month, 1);
            var candidate = CreateBillingDate(monthCursor.Year, monthCursor.Month, billingDay);

            if (candidate < reference)
            {
                monthCursor = monthCursor.AddMonths(1);
                candidate = CreateBillingDate(monthCursor.Year, monthCursor.Month, billingDay);
            }

            while (candidate < firstPayment)
            {
                monthCursor = monthCursor.AddMonths(1);
                candidate = CreateBillingDate(monthCursor.Year, monthCursor.Month, billingDay);
            }

            return candidate;
        }

        private static DateTime GetNextYearlyBillingDate(
            DateTime reference,
            DateTime firstPayment,
            int billingDay,
            int? billingMonth)
        {
            var anchorMonth = billingMonth ?? firstPayment.Month;
            var candidateYear = reference.Year;
            var candidate = CreateBillingDate(candidateYear, anchorMonth, billingDay);

            if (candidate < reference)
            {
                candidateYear++;
                candidate = CreateBillingDate(candidateYear, anchorMonth, billingDay);
            }

            while (candidate < firstPayment)
            {
                candidateYear++;
                candidate = CreateBillingDate(candidateYear, anchorMonth, billingDay);
            }

            return candidate;
        }

        private static DateTime Advance(DateTime current, BillingPeriod billingPeriod, int billingDay, int? billingMonth)
        {
            if (billingPeriod == BillingPeriod.Yearly)
            {
                var anchorMonth = billingMonth ?? current.Month;
                return CreateBillingDate(current.Year + 1, anchorMonth, billingDay);
            }

            var nextMonth = new DateTime(current.Year, current.Month, 1).AddMonths(1);
            return CreateBillingDate(nextMonth.Year, nextMonth.Month, billingDay);
        }

        private static DateTime CreateBillingDate(int year, int month, int billingDay)
        {
            var safeDay = Math.Min(billingDay, DateTime.DaysInMonth(year, month));
            return new DateTime(year, month, safeDay, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
