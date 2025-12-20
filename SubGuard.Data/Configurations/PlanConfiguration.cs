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
                new Plan { Id = 3003, CatalogId = 108, Name = "Öğrenci", Price = 37.99m, Currency = "TRY", BillingCycleDays = 30 }
            );
        }
    }
}