using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.DTOs.Auth
{
    public class UserProfileDto
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public int TotalSubscriptions { get; set; } // Bonus özellik
        public decimal MonthlyBudget { get; set; } // Yeni Alan
    }
}
