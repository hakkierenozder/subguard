using System.Threading.Tasks;

namespace SubGuard.Core.Services
{
    public interface INotificationService
    {
        /// <summary>
        /// Ödemesi yaklaşan abonelikleri kontrol eder ve kuyruğa atar.
        /// </summary>
        /// <param name="daysBefore">Kaç gün öncesinden haber verilecek?</param>
        Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore);
    }
}