using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }

        // Denetim (Audit) Alanları
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        // Güvenlik: Veriyi asla yok etme, sadece görünmez yap.
        public bool IsDeleted { get; set; } = false;
    }
}
