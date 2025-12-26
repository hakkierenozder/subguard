using Microsoft.EntityFrameworkCore; // ToListAsync için gerekli
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SubGuard.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IGenericRepository<UserSubscription> _subscriptionRepo;
        private readonly IGenericRepository<NotificationQueue> _queueRepo;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(
            IGenericRepository<UserSubscription> subscriptionRepo,
            IGenericRepository<NotificationQueue> queueRepo,
            IUnitOfWork unitOfWork)
        {
            _subscriptionRepo = subscriptionRepo;
            _queueRepo = queueRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore)
        {
            var targetDate = DateTime.UtcNow.AddDays(daysBefore);
            var targetDay = targetDate.Day;

            // DÜZELTME: Repo'daki 'Where' metodu IQueryable döner. 
            // Veritabanı sorgusunu gerçekleştirmek için ToListAsync kullanıyoruz.
            var upcomingSubscriptions = await _subscriptionRepo.Where(x =>
                x.IsActive &&
                !x.IsDeleted &&
                x.BillingDay == targetDay
            ).ToListAsync();

            // Liste boşsa işlem yapma
            if (upcomingSubscriptions == null || !upcomingSubscriptions.Any())
                return;

            foreach (var sub in upcomingSubscriptions)
            {
                // Mükerrer kontrolü (Opsiyonel: Aynı gün aynı kullanıcıya bildirim gitmiş mi?)
                // Şimdilik iş mantığı gereği direkt ekliyoruz.

                var notification = new NotificationQueue
                {
                    UserId = sub.UserId,
                    UserSubscriptionId = sub.Id,
                    Title = "Ödeme Hatırlatması",
                    Message = $"{sub.Name} aboneliğinizin ödemesi {daysBefore} gün sonra. Tutar: {sub.Price} {sub.Currency}",
                    ScheduledDate = DateTime.UtcNow,
                    IsSent = false,
                    CreatedDate = DateTime.UtcNow
                };

                await _queueRepo.AddAsync(notification);
            }

            await _unitOfWork.CommitAsync();
        }
    }
}