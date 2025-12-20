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

            // İlişki: Bir UserSubscription bir Catalog'a aittir.
            builder.HasOne(x => x.Catalog)
                              .WithMany()
                              .HasForeignKey(x => x.CatalogId)
                              .IsRequired(false);

            builder.ToTable("UserSubscriptions");
        }
    }
}