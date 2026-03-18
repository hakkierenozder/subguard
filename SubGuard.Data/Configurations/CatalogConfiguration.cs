using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace SubGuard.Data.Configurations
{
    public class CatalogConfiguration : IEntityTypeConfiguration<Catalog>
    {
        // Google S2 Favicons API — ücretsiz, auth gerektirmez, PNG döndürür, çok güvenilir
        private static string Logo(string domain) =>
            $"https://www.google.com/s2/favicons?sz=128&domain={domain}";

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
                   .OnDelete(DeleteBehavior.Restrict);

            builder.ToTable("Catalogs");

            // --- 1. KATEGORİ: STREAMING (Dizi/Film) ---
            builder.HasData(
                new Catalog { Id = 101, Name = "Netflix", Category = "Streaming", ColorCode = "#E50914", LogoUrl = Logo("netflix.com"), RequiresContract = false },
                new Catalog { Id = 102, Name = "Disney+", Category = "Streaming", ColorCode = "#113CCF", LogoUrl = Logo("disneyplus.com"), RequiresContract = false },
                new Catalog { Id = 103, Name = "BluTV", Category = "Streaming", ColorCode = "#11D6D4", LogoUrl = Logo("blutv.com"), RequiresContract = false },
                new Catalog { Id = 104, Name = "Amazon Prime", Category = "Streaming", ColorCode = "#00A8E1", LogoUrl = Logo("primevideo.com"), RequiresContract = false },
                new Catalog { Id = 105, Name = "Exxen", Category = "Streaming", ColorCode = "#FFD600", LogoUrl = Logo("exxen.com"), RequiresContract = false },
                new Catalog { Id = 106, Name = "MUBI", Category = "Streaming", ColorCode = "#191919", LogoUrl = Logo("mubi.com"), RequiresContract = false },
                new Catalog { Id = 107, Name = "TOD (beIN)", Category = "Streaming", ColorCode = "#592878", LogoUrl = Logo("tod.tv"), RequiresContract = true },
                new Catalog { Id = 108, Name = "YouTube Premium", Category = "Streaming", ColorCode = "#FF0000", LogoUrl = Logo("youtube.com"), RequiresContract = false },
                new Catalog { Id = 109, Name = "Gain", Category = "Streaming", ColorCode = "#FF6A00", LogoUrl = Logo("gain.tv"), RequiresContract = false },
                new Catalog { Id = 110, Name = "Puhutv", Category = "Streaming", ColorCode = "#E8261A", LogoUrl = Logo("puhutv.com"), RequiresContract = false },
                new Catalog { Id = 111, Name = "Tabii", Category = "Streaming", ColorCode = "#1A936F", LogoUrl = Logo("tabii.com"), RequiresContract = false },
                new Catalog { Id = 112, Name = "Apple TV+", Category = "Streaming", ColorCode = "#000000", LogoUrl = Logo("apple.com"), RequiresContract = false },
                new Catalog { Id = 113, Name = "Paramount+", Category = "Streaming", ColorCode = "#0064FF", LogoUrl = Logo("paramountplus.com"), RequiresContract = false },
                new Catalog { Id = 114, Name = "Crunchyroll", Category = "Streaming", ColorCode = "#F47521", LogoUrl = Logo("crunchyroll.com"), RequiresContract = false },
                new Catalog { Id = 115, Name = "Turkcell TV+", Category = "Streaming", ColorCode = "#009EDB", LogoUrl = Logo("tvplus.com.tr"), RequiresContract = false }
            );

            // --- 2. KATEGORİ: MUSIC (Müzik) ---
            builder.HasData(
                new Catalog { Id = 201, Name = "Spotify", Category = "Music", ColorCode = "#1DB954", LogoUrl = Logo("spotify.com"), RequiresContract = false },
                new Catalog { Id = 202, Name = "Apple Music", Category = "Music", ColorCode = "#FA243C", LogoUrl = Logo("music.apple.com"), RequiresContract = false },
                new Catalog { Id = 203, Name = "Fizy", Category = "Music", ColorCode = "#F39200", LogoUrl = Logo("fizy.com"), RequiresContract = false },
                new Catalog { Id = 204, Name = "Deezer", Category = "Music", ColorCode = "#EF5466", LogoUrl = Logo("deezer.com"), RequiresContract = false },
                new Catalog { Id = 205, Name = "Tidal", Category = "Music", ColorCode = "#000000", LogoUrl = Logo("tidal.com"), RequiresContract = false },
                new Catalog { Id = 206, Name = "Muud", Category = "Music", ColorCode = "#FF6B35", LogoUrl = Logo("muud.com.tr"), RequiresContract = false }
            );

            // --- 3. KATEGORİ: GAMING (Oyun) ---
            builder.HasData(
                new Catalog { Id = 301, Name = "PlayStation Plus", Category = "Gaming", ColorCode = "#00439C", LogoUrl = Logo("playstation.com"), RequiresContract = false },
                new Catalog { Id = 302, Name = "Xbox Game Pass", Category = "Gaming", ColorCode = "#107C10", LogoUrl = Logo("xbox.com"), RequiresContract = false },
                new Catalog { Id = 303, Name = "GeForce Now", Category = "Gaming", ColorCode = "#76B900", LogoUrl = Logo("nvidia.com"), RequiresContract = false },
                new Catalog { Id = 304, Name = "Discord Nitro", Category = "Gaming", ColorCode = "#5865F2", LogoUrl = Logo("discord.com"), RequiresContract = false },
                new Catalog { Id = 305, Name = "Steam", Category = "Gaming", ColorCode = "#1B2838", LogoUrl = Logo("steampowered.com"), RequiresContract = false },
                new Catalog { Id = 306, Name = "EA Play", Category = "Gaming", ColorCode = "#FF4747", LogoUrl = Logo("ea.com"), RequiresContract = false }
            );

            // --- 4. KATEGORİ: SHOPPING & FOOD (Alışveriş & Yemek) ---
            builder.HasData(
                new Catalog { Id = 401, Name = "Hepsiburada Premium", Category = "Shopping", ColorCode = "#FF6000", LogoUrl = Logo("hepsiburada.com"), RequiresContract = false },
                new Catalog { Id = 402, Name = "Yemeksepeti Club", Category = "Food", ColorCode = "#EA004B", LogoUrl = Logo("yemeksepeti.com"), RequiresContract = false },
                new Catalog { Id = 403, Name = "Getir", Category = "Food", ColorCode = "#5D3EB2", LogoUrl = Logo("getir.com"), RequiresContract = false },
                new Catalog { Id = 404, Name = "Trendyol Premium", Category = "Shopping", ColorCode = "#F27A1A", LogoUrl = Logo("trendyol.com"), RequiresContract = false }
            );

            // --- 5. KATEGORİ: CLOUD & PRODUCTIVITY (Bulut & Üretkenlik) ---
            builder.HasData(
                new Catalog { Id = 501, Name = "Apple iCloud", Category = "Cloud", ColorCode = "#007AFF", LogoUrl = Logo("icloud.com"), RequiresContract = false },
                new Catalog { Id = 502, Name = "Google One", Category = "Cloud", ColorCode = "#4285F4", LogoUrl = Logo("one.google.com"), RequiresContract = false },
                new Catalog { Id = 503, Name = "Microsoft 365", Category = "Cloud", ColorCode = "#EA3E23", LogoUrl = Logo("microsoft.com"), RequiresContract = true },
                new Catalog { Id = 504, Name = "Dropbox", Category = "Cloud", ColorCode = "#0061FF", LogoUrl = Logo("dropbox.com"), RequiresContract = false },
                new Catalog { Id = 505, Name = "Adobe Creative Cloud", Category = "Cloud", ColorCode = "#FF0000", LogoUrl = Logo("adobe.com"), RequiresContract = true },
                new Catalog { Id = 506, Name = "Canva Pro", Category = "Cloud", ColorCode = "#00C4CC", LogoUrl = Logo("canva.com"), RequiresContract = false },
                new Catalog { Id = 507, Name = "ChatGPT Plus", Category = "Cloud", ColorCode = "#10A37F", LogoUrl = Logo("openai.com"), RequiresContract = false },
                new Catalog { Id = 508, Name = "NordVPN", Category = "Cloud", ColorCode = "#4687FF", LogoUrl = Logo("nordvpn.com"), RequiresContract = false }
            );

            // --- 6. KATEGORİ: EDUCATION (Eğitim) ---
            builder.HasData(
                new Catalog { Id = 601, Name = "Duolingo Plus", Category = "Education", ColorCode = "#58CC02", LogoUrl = Logo("duolingo.com"), RequiresContract = false },
                new Catalog { Id = 602, Name = "LinkedIn Premium", Category = "Education", ColorCode = "#0A66C2", LogoUrl = Logo("linkedin.com"), RequiresContract = false }
            );
        }
    }
}
