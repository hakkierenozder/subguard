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

            // Yalnızca aktif abonelikler rapora dahil edilir.
            // Duraklatılmış (Paused) abonelikler o dönemde ödeme gerektirmez.
            var subscriptions = await _subRepo
                .Where(x => x.UserId == userId && x.Status == SubscriptionStatus.Active)
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
            // Dönemsel adım hesapla
            var step = sub.BillingPeriod switch
            {
                BillingPeriod.Yearly => TimeSpan.FromDays(365),
                _ => TimeSpan.FromDays(0) // Monthly — aşağıda özel işlem
            };

            // İlk potansiyel ödeme tarihini bul: from'un içinde bulunduğu ayın BillingDay'i
            var cursor = new DateTime(from.Year, from.Month,
                Math.Min(sub.BillingDay, DateTime.DaysInMonth(from.Year, from.Month)),
                0, 0, 0, DateTimeKind.Utc);

            // Cursor from'dan önceyse bir dönem ilerlet
            if (cursor < from.Date)
                cursor = AdvanceByPeriod(cursor, sub.BillingPeriod);

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
