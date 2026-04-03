using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Helpers;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class ReportService : IReportService
    {
        private readonly IGenericRepository<UserSubscription> _subRepo;

        public ReportService(IGenericRepository<UserSubscription> subRepo)
        {
            _subRepo = subRepo;
        }

        public async Task<CustomResponseDto<SpendingReportDto>> GetSpendingReportAsync(
            string userId, DateTime from, DateTime to)
        {
            if (from > to)
                return CustomResponseDto<SpendingReportDto>.Fail(400, "'from' tarihi 'to' tarihinden büyük olamaz.");

            if ((to - from).TotalDays > 366)
                return CustomResponseDto<SpendingReportDto>.Fail(400, "Tarih aralığı 366 günü geçemez.");

            // Tüm abonelikler rapora dahil edilir (aktif, duraklatılmış ve iptal edilmiş).
            // İptal tarihi aralık başlangıcından önce ise dahil edilmez.
            var subscriptions = (await _subRepo
                .Where(x => x.UserId == userId
                    && (x.CancelledDate == null || x.CancelledDate.Value.Date >= from.Date))
                .Include(x => x.Shares)
                .ToListAsync())
                .Where(x => SubscriptionBillingHelper.GetEffectiveFirstPaymentDate(x) <= to.Date)
                .ToList();

            var lines = new List<SpendingLineDto>();

            foreach (var sub in subscriptions)
            {
                var effectiveTo = GetEffectiveReportEndDate(sub, to);
                if (effectiveTo < from.Date) continue;

                var paymentCount = CountPaymentsInRange(sub, from, effectiveTo);
                if (paymentCount == 0) continue;

                var shareCount = sub.Shares.Count(share => !share.IsDeleted);
                var userShareUnitPrice = BillingPriceHelper.ApplyUserShare(sub.Price, shareCount);

                lines.Add(new SpendingLineDto
                {
                    SubscriptionId = sub.Id,
                    Name = sub.Name,
                    Category = sub.Category,
                    Currency = sub.Currency,
                    UnitPrice = userShareUnitPrice,
                    PaymentCount = paymentCount,
                    TotalAmount = userShareUnitPrice * paymentCount,
                    BillingPeriod = sub.BillingPeriod.ToString()
                });
            }

            var totalByCurrency = lines
                .GroupBy(l => l.Currency)
                .ToDictionary(g => g.Key, g => g.Sum(l => l.TotalAmount));

            return CustomResponseDto<SpendingReportDto>.Success(200, new SpendingReportDto
            {
                From = from,
                To = to,
                TotalByCurrency = totalByCurrency,
                Lines = lines.OrderByDescending(l => l.TotalAmount).ToList()
            });
        }

        /// <summary>
        /// Belirli bir abonelik için [from, to] aralığında kaç ödeme tarihi düşüyor hesaplar.
        /// </summary>
        private static int CountPaymentsInRange(UserSubscription sub, DateTime from, DateTime to) =>
            SubscriptionBillingHelper.CountPaymentsInRange(sub, from, to);

        private static DateTime GetEffectiveReportEndDate(UserSubscription sub, DateTime requestedTo)
        {
            var effectiveTo = requestedTo.Date;

            if (sub.CancelledDate.HasValue && sub.CancelledDate.Value.Date < effectiveTo)
                effectiveTo = sub.CancelledDate.Value.Date;

            if (sub.Status == SubGuard.Core.Enums.SubscriptionStatus.Paused &&
                sub.PausedDate.HasValue &&
                sub.PausedDate.Value.Date < effectiveTo)
            {
                effectiveTo = sub.PausedDate.Value.Date;
            }

            return effectiveTo;
        }
    }
}
