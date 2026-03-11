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

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = _httpContextAccessor.HttpContext?
            .User.FindFirstValue(ClaimTypes.NameIdentifier);

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
    }
}