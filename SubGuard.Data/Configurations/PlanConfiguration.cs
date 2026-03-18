using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;

namespace SubGuard.Data.Configurations
{
    public class PlanConfiguration : IEntityTypeConfiguration<Plan>
    {
        public void Configure(EntityTypeBuilder<Plan> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            // Fiyat alanı için hassasiyet ayarı (Opsiyonel ama iyi pratiktir)
            builder.Property(x => x.Price).HasColumnType("decimal(18,2)");

            builder.ToTable("Plans");

            // SEED DATA: Paket Fiyatları (Eksik olan kısım buydu)
            // --- PLANLAR (Örnekler) ---
            builder.HasData(
                // Netflix
                new Plan { Id = 1001, CatalogId = 101, Name = "Temel Plan", Price = 149.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 1002, CatalogId = 101, Name = "Standart Plan", Price = 229.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 1003, CatalogId = 101, Name = "Özel Plan", Price = 299.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Spotify
                new Plan { Id = 2001, CatalogId = 201, Name = "Bireysel", Price = 59.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 2002, CatalogId = 201, Name = "Öğrenci", Price = 32.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 2003, CatalogId = 201, Name = "Duo", Price = 79.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 2004, CatalogId = 201, Name = "Aile", Price = 99.99m, Currency = "TRY", BillingCycleDays = 30 },

                // YouTube Premium
                new Plan { Id = 3001, CatalogId = 108, Name = "Bireysel", Price = 57.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 3002, CatalogId = 108, Name = "Aile", Price = 115.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 3003, CatalogId = 108, Name = "Öğrenci", Price = 37.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Puhutv
                new Plan { Id = 4001, CatalogId = 110, Name = "Bireysel", Price = 59.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 4002, CatalogId = 110, Name = "Aile", Price = 99.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Tabii
                new Plan { Id = 4101, CatalogId = 111, Name = "Bireysel", Price = 39.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 4102, CatalogId = 111, Name = "Aile", Price = 59.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Apple TV+
                new Plan { Id = 4201, CatalogId = 112, Name = "Bireysel", Price = 79.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 4202, CatalogId = 112, Name = "Aile", Price = 119.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Paramount+
                new Plan { Id = 4301, CatalogId = 113, Name = "Bireysel", Price = 49.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Crunchyroll
                new Plan { Id = 4401, CatalogId = 114, Name = "Fanatic", Price = 49.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 4402, CatalogId = 114, Name = "Mega Fan", Price = 89.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Turkcell TV+
                new Plan { Id = 4501, CatalogId = 115, Name = "Bireysel", Price = 29.99m, Currency = "TRY", BillingCycleDays = 30 },
                new Plan { Id = 4502, CatalogId = 115, Name = "Aile", Price = 59.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Tidal
                new Plan { Id = 5001, CatalogId = 205, Name = "Bireysel", Price = 12.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5002, CatalogId = 205, Name = "Aile", Price = 19.99m, Currency = "USD", BillingCycleDays = 30 },

                // EA Play
                new Plan { Id = 5101, CatalogId = 306, Name = "EA Play", Price = 4.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5102, CatalogId = 306, Name = "EA Play Pro", Price = 14.99m, Currency = "USD", BillingCycleDays = 30 },

                // Trendyol Premium
                new Plan { Id = 5201, CatalogId = 404, Name = "Premium Üyelik", Price = 99.99m, Currency = "TRY", BillingCycleDays = 30 },

                // Dropbox
                new Plan { Id = 5301, CatalogId = 504, Name = "Plus (2 TB)", Price = 9.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5302, CatalogId = 504, Name = "Professional (3 TB)", Price = 16.58m, Currency = "USD", BillingCycleDays = 30 },

                // Adobe Creative Cloud
                new Plan { Id = 5401, CatalogId = 505, Name = "Tüm Uygulamalar", Price = 54.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5402, CatalogId = 505, Name = "Tek Uygulama", Price = 20.99m, Currency = "USD", BillingCycleDays = 30 },

                // Canva Pro
                new Plan { Id = 5501, CatalogId = 506, Name = "Pro", Price = 119.99m, Currency = "TRY", BillingCycleDays = 30 },

                // ChatGPT Plus
                new Plan { Id = 5601, CatalogId = 507, Name = "Plus", Price = 20.00m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5602, CatalogId = 507, Name = "Pro", Price = 200.00m, Currency = "USD", BillingCycleDays = 30 },

                // NordVPN
                new Plan { Id = 5701, CatalogId = 508, Name = "Basic", Price = 3.79m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5702, CatalogId = 508, Name = "Plus", Price = 4.79m, Currency = "USD", BillingCycleDays = 30 },

                // Duolingo Plus
                new Plan { Id = 5801, CatalogId = 601, Name = "Super", Price = 6.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5802, CatalogId = 601, Name = "Max", Price = 13.99m, Currency = "USD", BillingCycleDays = 30 },

                // LinkedIn Premium
                new Plan { Id = 5901, CatalogId = 602, Name = "Career", Price = 29.99m, Currency = "USD", BillingCycleDays = 30 },
                new Plan { Id = 5902, CatalogId = 602, Name = "Business", Price = 59.99m, Currency = "USD", BillingCycleDays = 30 }
            );
        }
    }
}