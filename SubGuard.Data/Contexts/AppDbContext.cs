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

    // Otomatik Tarih Atama Mekanizması (Interceptor Mantığı)
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
                        // Yeni eklenen veri silinmiş olamaz
                        entityReference.IsDeleted = false;
                        break;

                    case EntityState.Modified:
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

        // Configurations klasöründeki tüm ayarları (ServiceConfiguration vb.) otomatik bul ve uygula.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // GLOBAL QUERY FILTER (Çok Önemli!)
        // "IsDeleted = true" olan kayıtları asla getirme. Select * from Services dediğimizde
        // EF Core arkada otomatik olarak "... WHERE IsDeleted = false" ekler.
        modelBuilder.Entity<Catalog>().HasQueryFilter(x => !x.IsDeleted);
        modelBuilder.Entity<Plan>().HasQueryFilter(x => !x.IsDeleted);

        base.OnModelCreating(modelBuilder);
    }
}