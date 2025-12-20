using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    public class UserSubscription : BaseEntity
    {
        // Hangi Kullanıcı? (Şimdilik DeviceId veya basit bir UserId tutabiliriz)
        public string UserId { get; set; }

        // Hangi Servis? (İlişkili Veri)
        public int CatalogId { get; set; }
        [ForeignKey("CatalogId")]
        public Catalog Catalog { get; set; }

        // Özelleştirilmiş Veriler
        public string Name { get; set; } // Kullanıcı ismini değiştirebilir
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingDay { get; set; } // Fatura Günü (1-31)
        public string Category { get; set; }

        // Sözleşme Bilgileri
        public bool HasContract { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        // JSON olarak tutulabilir veya ayrı tablo yapılabilir. 
        // Basitlik için şimdilik JSON string veya boş geçiyoruz.
        // public string? SharedWithJson { get; set; } 
    }
}
