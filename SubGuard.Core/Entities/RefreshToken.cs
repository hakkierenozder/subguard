using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string Code { get; set; } // Token'ın kendisi
        public string UserId { get; set; } // Hangi kullanıcıya ait
        public DateTime Expiration { get; set; } // Ne zaman geçerliliğini yitirir

        // Navigation Property (Opsiyonel ama iyi pratik)
        // public AppUser AppUser { get; set; } 
    }
}
