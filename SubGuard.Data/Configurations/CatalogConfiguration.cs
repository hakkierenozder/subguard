using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
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
            // Bu kodları AppDbContext.cs içerisindeki OnModelCreating metoduna ekleyebilirsin.
            // Veya yeni bir Migration oluşturup Up metoduna uyarlayabilirsin.

            // --- 1. KATEGORİ: STREAMING (Dizi/Film) ---
            builder.HasData(
                new Catalog { Id = 101, Name = "Netflix", Category = "Streaming", ColorCode = "#E50914", LogoUrl = "netflix_logo", RequiresContract = false },
                new Catalog { Id = 102, Name = "Disney+", Category = "Streaming", ColorCode = "#113CCF", LogoUrl = "disney_logo", RequiresContract = false },
                new Catalog { Id = 103, Name = "BluTV", Category = "Streaming", ColorCode = "#11D6D4", LogoUrl = "blutv_logo", RequiresContract = false },
                new Catalog { Id = 104, Name = "Amazon Prime", Category = "Streaming", ColorCode = "#00A8E1", LogoUrl = "prime_logo", RequiresContract = false },
                new Catalog { Id = 105, Name = "Exxen", Category = "Streaming", ColorCode = "#FFD600", LogoUrl = "exxen_logo", RequiresContract = false },
                new Catalog { Id = 106, Name = "MUBI", Category = "Streaming", ColorCode = "#191919", LogoUrl = "mubi_logo", RequiresContract = false },
                new Catalog { Id = 107, Name = "TOD (beIN)", Category = "Streaming", ColorCode = "#592878", LogoUrl = "tod_logo", RequiresContract = true },
                new Catalog { Id = 108, Name = "YouTube Premium", Category = "Streaming", ColorCode = "#FF0000", LogoUrl = "youtube_logo", RequiresContract = false },
                new Catalog { Id = 109, Name = "Gain", Category = "Streaming", ColorCode = "#FF0000", LogoUrl = "gain_logo", RequiresContract = false }
            );

            // --- 2. KATEGORİ: MUSIC (Müzik) ---
            builder.HasData(
                new Catalog { Id = 201, Name = "Spotify", Category = "Music", ColorCode = "#1DB954", LogoUrl = "spotify_logo", RequiresContract = false },
                new Catalog { Id = 202, Name = "Apple Music", Category = "Music", ColorCode = "#FA243C", LogoUrl = "applemusic_logo", RequiresContract = false },
                new Catalog { Id = 203, Name = "Fizy", Category = "Music", ColorCode = "#F39200", LogoUrl = "fizy_logo", RequiresContract = false },
                new Catalog { Id = 204, Name = "Deezer", Category = "Music", ColorCode = "#EF5466", LogoUrl = "deezer_logo", RequiresContract = false }
            );

            // --- 3. KATEGORİ: GAMING (Oyun) ---
            builder.HasData(
                new Catalog { Id = 301, Name = "PlayStation Plus", Category = "Gaming", ColorCode = "#00439C", LogoUrl = "psplus_logo", RequiresContract = false },
                new Catalog { Id = 302, Name = "Xbox Game Pass", Category = "Gaming", ColorCode = "#107C10", LogoUrl = "gamepass_logo", RequiresContract = false },
                new Catalog { Id = 303, Name = "GeForce Now", Category = "Gaming", ColorCode = "#76B900", LogoUrl = "gfn_logo", RequiresContract = false },
                new Catalog { Id = 304, Name = "Discord Nitro", Category = "Gaming", ColorCode = "#5865F2", LogoUrl = "discord_logo", RequiresContract = false }
            );

            // --- 4. KATEGORİ: SHOPPING & FOOD (Alışveriş) ---
            builder.HasData(
                new Catalog { Id = 401, Name = "Hepsiburada Premium", Category = "Shopping", ColorCode = "#FF6000", LogoUrl = "hepsiburada_logo", RequiresContract = false },
                new Catalog { Id = 402, Name = "Yemeksepeti Club", Category = "Food", ColorCode = "#EA004B", LogoUrl = "yemeksepeti_logo", RequiresContract = false },
                new Catalog { Id = 403, Name = "Getir", Category = "Food", ColorCode = "#5D3EB2", LogoUrl = "getir_logo", RequiresContract = false }
            );

            // --- 5. KATEGORİ: CLOUD & PRODUCTIVITY (Bulut/İş) ---
            builder.HasData(
                new Catalog { Id = 501, Name = "Apple iCloud", Category = "Cloud", ColorCode = "#007AFF", LogoUrl = "icloud_logo", RequiresContract = false },
                new Catalog { Id = 502, Name = "Google One", Category = "Cloud", ColorCode = "#4285F4", LogoUrl = "googleone_logo", RequiresContract = false },
                new Catalog { Id = 503, Name = "Microsoft 365", Category = "Cloud", ColorCode = "#EA3E23", LogoUrl = "office_logo", RequiresContract = true }
            );


        }
    }
}
