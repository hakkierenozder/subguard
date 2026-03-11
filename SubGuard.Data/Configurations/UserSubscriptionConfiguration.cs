using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;

namespace SubGuard.Data.Configurations
{
    public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
    {
        public void Configure(EntityTypeBuilder<UserSubscription> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
            builder.Property(x => x.Name).HasMaxLength(100);

            // JSON alanları PostgreSQL jsonb tipinde saklanır
            builder.Property(x => x.SharedWithJson).HasColumnType("jsonb");
            builder.Property(x => x.UsageHistoryJson).HasColumnType("jsonb");

            // İlişki: Bir UserSubscription bir Catalog'a aittir.
            builder.HasOne(x => x.Catalog)
                              .WithMany()
                              .HasForeignKey(x => x.CatalogId)
                              .IsRequired(false);

            // Index: UserId ile hızlı sorgulama
            builder.HasIndex(x => x.UserId)
                   .HasDatabaseName("IX_UserSubscriptions_UserId");

            // Unique constraint: Aynı kullanıcı aynı isimde iki abonelik ekleyemez
            builder.HasIndex(x => new { x.UserId, x.Name })
                   .IsUnique()
                   .HasDatabaseName("UQ_UserSubscriptions_UserId_Name");

            builder.ToTable("UserSubscriptions");
        }
    }
}