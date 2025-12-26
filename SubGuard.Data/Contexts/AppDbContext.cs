using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.Entities;
using System.Reflection;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Catalog> Catalogs { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<UserSubscription> UserSubscriptions { get; set; }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var item in ChangeTracker.Entries())
        {
            if (item.Entity is BaseEntity entityReference)
            {
                switch (item.State)
                {
                    case EntityState.Added:
                        entityReference.CreatedDate = DateTime.UtcNow;
                        entityReference.IsDeleted = false;
                        break;

                    case EntityState.Modified:
                        // Remove metodu Update olarak çalıştığı için buraya düşecek 
                        // ve UpdatedDate otomatik set edilecek.
                        entityReference.UpdatedDate = DateTime.UtcNow;
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
    }
}