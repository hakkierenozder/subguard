using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SabGuard.Data.Configurations
{
    public class CatalogConfiguration : IEntityTypeConfiguration<Catalog>
    {
        public void Configure(EntityTypeBuilder<Catalog> builder)
        {
            // Kurallar
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.LogoUrl).IsRequired(false).HasMaxLength(500);

            // İlişki Tanımı (Bir Service'in çok Plan'ı olur)
            builder.HasMany(x => x.Plans)
                   .WithOne(x => x.Catalog)
                   .HasForeignKey(x => x.CatalogId)
                   .OnDelete(DeleteBehavior.Restrict); // Servis silinirse planları silme, hata ver (Güvenlik)

            // Tablo Adı
            builder.ToTable("Catalogs");

            // Seed Data (Başlangıç Verileri)
            builder.HasData(
                new Catalog { Id = 1, Name = "Netflix", Category = "Streaming", ColorCode = "#E50914", RequiresContract = false, CreatedDate = DateTime.UtcNow },
                new Catalog { Id = 2, Name = "Turkcell", Category = "GSM", ColorCode = "#FFC900", RequiresContract = true, CreatedDate = DateTime.UtcNow },
                new Catalog { Id = 3, Name = "Spotify", Category = "Music", ColorCode = "#1DB954", RequiresContract = false, CreatedDate = DateTime.UtcNow },
                new Catalog { Id = 4, Name = "Apple iCloud", Category = "Cloud", ColorCode = "#000000", RequiresContract = false, CreatedDate = DateTime.UtcNow }
            );
        }
    }
}
