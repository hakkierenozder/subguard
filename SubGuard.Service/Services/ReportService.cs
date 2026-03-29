using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Enums;
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
            var subscriptions = await _subRepo
                .Where(x => x.UserId == userId
                    && x.CreatedDate.Date <= to.Date
                    && (x.CancelledDate == null || x.CancelledDate.Value.Date >= from.Date))
                .ToListAsync();

            var lines = new List<SpendingLineDto>();

            foreach (var sub in subscriptions)
            {
                var paymentCount = CountPaymentsInRange(sub, from, to);
                if (paymentCount == 0) continue;

                lines.Add(new SpendingLineDto
                {
                    SubscriptionId = sub.Id,
                    Name = sub.Name,
                    Currency = sub.Currency,
                    UnitPrice = sub.Price,
                    PaymentCount = paymentCount,
                    TotalAmount = sub.Price * paymentCount,
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
        private static int CountPaymentsInRange(UserSubscription sub, DateTime from, DateTime to)
        {
            // Abonelik oluşturulmadan önceki ödemeler sayılmamalı
            var effectiveFrom = from.Date < sub.CreatedDate.Date ? sub.CreatedDate.Date : from.Date;
            if (effectiveFrom > to.Date) return 0;

            DateTime cursor;

            if (sub.BillingPeriod == BillingPeriod.Yearly)
            {
                // B-4: Yıllık abonelikler için cursor, BillingMonth (yoksa CreatedDate.Month) ile başlar.
                // Raporun başlangıç ayından değil, aboneliğin ödeme ayından başlamazsa aylar arası
                // ödemeler atlanabilir veya yanlış yıla atanabilir.
                var billingMonth = sub.BillingMonth ?? sub.CreatedDate.Month;
                var candidateYear = effectiveFrom.Year;
                var safeDay = Math.Min(sub.BillingDay, DateTime.DaysInMonth(candidateYear, billingMonth));
                cursor = new DateTime(candidateYear, billingMonth, safeDay, 0, 0, 0, DateTimeKind.Utc);

                // Eğer bu yılın ödeme tarihi effectiveFrom'dan önceyse bir sonraki yıla geç
                if (cursor < effectiveFrom)
                    cursor = cursor.AddYears(1);
            }
            else
            {
                // Aylık: İlk potansiyel ödeme tarihini bul — effectiveFrom ayının BillingDay'i
                cursor = new DateTime(effectiveFrom.Year, effectiveFrom.Month,
                    Math.Min(sub.BillingDay, DateTime.DaysInMonth(effectiveFrom.Year, effectiveFrom.Month)),
                    0, 0, 0, DateTimeKind.Utc);

                // Cursor effectiveFrom'dan önceyse bir ay ilerlet
                if (cursor < effectiveFrom)
                    cursor = AdvanceByPeriod(cursor, sub.BillingPeriod);
            }

            int count = 0;
            while (cursor <= to.Date)
            {
                count++;
                cursor = AdvanceByPeriod(cursor, sub.BillingPeriod);
            }
            return count;
        }

        private static DateTime AdvanceByPeriod(DateTime date, BillingPeriod period) => period switch
        {
            BillingPeriod.Yearly => date.AddYears(1),
            _ => date.AddMonths(1)  // Monthly
        };
    }
}
