using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities;
using System.Reflection;
using System.Security.Claims;

public class AppDbContext : IdentityDbContext<AppUser>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor httpContextAccessor) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<Catalog> Catalogs { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<UserSubscription> UserSubscriptions { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; } // EKLENDİ
    public DbSet<NotificationQueue> NotificationQueues { get; set; } // <--- EKLENDİ
    public DbSet<CategoryBudget> CategoryBudgets { get; set; }
    public DbSet<PriceHistory> PriceHistories { get; set; } // Fiyat değişikliği geçmişi (silinmez)
    public DbSet<RevokedUserEntry> RevokedUserEntries { get; set; } // JWT revocation kalıcı listesi
    public DbSet<SubscriptionShare> SubscriptionShares { get; set; }       // T-3: SharedWithJson yerine
    public DbSet<SubscriptionUsageLog> SubscriptionUsageLogs { get; set; } // T-3: UsageHistoryJson yerine

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // HttpContext yoksa (Hangfire job, migration seed) "system" sabit ID'si kullanılır.
        var currentUserId = _httpContextAccessor.HttpContext?
            .User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "system";

        foreach (var item in ChangeTracker.Entries())
        {
            if (item.Entity is BaseEntity entityReference)
            {
                switch (item.State)
                {
                    case EntityState.Added:
                        entityReference.CreatedDate = DateTime.UtcNow;
                        entityReference.IsDeleted = false;
                        entityReference.CreatedBy = currentUserId;
                        break;

                    case EntityState.Modified:
                        entityReference.UpdatedDate = DateTime.UtcNow;
                        entityReference.UpdatedBy = currentUserId;
                        break;
                }
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // GLOBAL QUERY FILTER GÜNCELLEMESİ
        // Mevcut olanlar:
        modelBuilder.Entity<Catalog>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Plan>().HasQueryFilter(x => !x.IsDeleted);

        // EKLENEN: UserSubscription için de filtre uyguluyoruz.
        modelBuilder.Entity<UserSubscription>().HasQueryFilter(x => !x.IsDeleted);

        // Gelecekte eklenecek BaseEntity türevleri için de buraya ekleme yapılmalı.

        modelBuilder.Entity<NotificationQueue>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<CategoryBudget>().HasQueryFilter(x => !x.IsDeleted);

        // CategoryBudget: (UserId, Category) çifti benzersiz olmalı
        modelBuilder.Entity<CategoryBudget>()
            .HasIndex(b => new { b.UserId, b.Category })
            .IsUnique()
            .HasDatabaseName("IX_CategoryBudgets_UserId_Category");

        // RefreshToken: İptal edilmiş (IsDeleted=true) token'lar sorgularda görünmemeli.
        // Aksi hâlde revoke edilen token ile tekrar oturum açılabilir.
        modelBuilder.Entity<RefreshToken>().HasQueryFilter(x => !x.IsDeleted);

        // PriceHistory: Silinmiş aboneliklere ait fiyat geçmişi kayıtları
        // analytics ve raporlarda görünmemeli; aksi hâlde silinmiş aboneliklerin
        // maliyeti hâlâ hesaplamalara dahil olur.
        modelBuilder.Entity<PriceHistory>().HasQueryFilter(x => !x.IsDeleted);

        // EF Core uyarısını giderir: UserSubscription ile ilişkili entity'lere de
        // aynı soft-delete filtresi uygulanmalı (go.microsoft.com/fwlink/?linkid=2131316)
        modelBuilder.Entity<SubscriptionShare>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<SubscriptionUsageLog>().HasQueryFilter(x => !x.IsDeleted);

        // RefreshToken: Expiration üzerinden sorgu + purge job performansı için index
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(x => x.Expiration)
            .HasDatabaseName("IX_RefreshTokens_Expiration");

        // SubscriptionShare: (SubscriptionId, SharedUserId) çifti benzersiz olmalı
        modelBuilder.Entity<SubscriptionShare>()
            .HasIndex(s => new { s.SubscriptionId, s.SharedUserId })
            .IsUnique()
            .HasDatabaseName("IX_SubscriptionShares_SubId_UserId");

        // Soft delete ile Cascade Delete çakışmasını önlemek için Restrict kullanılır.
        // Fiziksel silme olmadığı için Cascade gerekmez; IsDeleted filtresi üzerinden yönetilir.
        modelBuilder.Entity<SubscriptionShare>()
            .HasOne(s => s.Subscription)
            .WithMany(sub => sub.Shares)
            .HasForeignKey(s => s.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubscriptionUsageLog: Restrict ile referans bütünlüğü korunur, soft delete yönetir
        modelBuilder.Entity<SubscriptionUsageLog>()
            .HasOne(l => l.Subscription)
            .WithMany(sub => sub.UsageLogs)
            .HasForeignKey(l => l.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);

        // PriceHistory: Soft delete ile yönetilir; fiziksel cascade gerekmez.
        // Restrict ile referans bütünlüğü korunur.
        modelBuilder.Entity<PriceHistory>()
            .HasOne<UserSubscription>()
            .WithMany()
            .HasForeignKey(p => p.SubscriptionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
