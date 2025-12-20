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
            builder.HasData(
                // Netflix (CatalogId: 1)
                new Plan { Id = 1, CatalogId = 1, Name = "Temel", Price = 119.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 2, CatalogId = 1, Name = "Standart", Price = 176.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 3, CatalogId = 1, Name = "Özel", Price = 229.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },

                // Spotify (CatalogId: 2)
                new Plan { Id = 4, CatalogId = 2, Name = "Bireysel", Price = 59.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 5, CatalogId = 2, Name = "Duo", Price = 79.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 6, CatalogId = 2, Name = "Aile", Price = 99.99m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },

                // Turkcell (CatalogId: 3)
                new Plan { Id = 7, CatalogId = 3, Name = "Platinum 20GB", Price = 350.00m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 8, CatalogId = 3, Name = "Gülümseten 10GB", Price = 220.00m, Currency = "TRY", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },

                new Plan { Id = 9, CatalogId = 4, Name = "50 GB", Price = 0.99m, Currency = "USD", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 10, CatalogId = 4, Name = "200 GB", Price = 2.99m, Currency = "USD", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow },
                new Plan { Id = 11, CatalogId = 4, Name = "2 TB", Price = 9.99m, Currency = "USD", BillingCycleDays = 30, CreatedDate = DateTime.UtcNow }
            );
        }
    }
}