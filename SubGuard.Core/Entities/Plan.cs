using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Core.Entities
{
    public class Plan : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingCycleDays { get; set; }

        // İLİŞKİ AYARLARI (Foreign Key)
        // Bu satırı eklemezsek EF Core kafasına göre isim verir!
        public int CatalogId { get; set; }

        // Navigation Property
        public Catalog Catalog { get; set; }
    }
}
