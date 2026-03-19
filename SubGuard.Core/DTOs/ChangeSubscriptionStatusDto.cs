using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    public class ChangeSubscriptionStatusDto
    {
        public SubscriptionStatus Status { get; set; }

        /// <summary>
        /// Aktif kontratı olan aboneliği iptal etmek için true gönderilmeli.
        /// Aksi hâlde 409 döner ve kullanıcıdan onay istenir.
        /// </summary>
        public bool ForceCancel { get; set; } = false;
    }
}
