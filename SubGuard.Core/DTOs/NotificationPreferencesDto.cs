namespace SubGuard.Core.DTOs
{
    public class NotificationPreferencesDto
    {
        public bool PushEnabled { get; set; } = true;
        public bool EmailEnabled { get; set; } = true;
        /// <summary>Ödeme kaç gün önceden hatırlatılsın (1-14)</summary>
        public int ReminderDaysBefore { get; set; } = 3;
        /// <summary>Bildirimlerin gönderileceği saat (0–23, varsayılan 9)</summary>
        public int NotifyHour { get; set; } = 9;
    }
}
