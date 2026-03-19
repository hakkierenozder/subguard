using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    // Standart IdentityUser'dan miras alıyoruz (Id, Email, PasswordHash vb. içinde hazır gelir)
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; }
        public decimal MonthlyBudget { get; set; } = 0;
        public string? MonthlyBudgetCurrency { get; set; }
        public string? ExpoPushToken { get; set; }

        // Bildirim tercihleri
        public bool NotifPushEnabled { get; set; } = true;
        public bool NotifEmailEnabled { get; set; } = true;
        public int NotifReminderDays { get; set; } = 3;

        // Bütçe uyarı eşiği (0–100 arası yüzde, varsayılan %80)
        public int BudgetAlertThreshold { get; set; } = 80;

        // Bildirim saati (0–23 arası, varsayılan 9 = sabah 9)
        public int NotifyHour { get; set; } = 9;
    }
}
