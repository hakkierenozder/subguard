using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;

namespace SubGuard.Data.Configurations
{
    public class NotificationQueueConfiguration : IEntityTypeConfiguration<NotificationQueue>
    {
        public void Configure(EntityTypeBuilder<NotificationQueue> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Title).HasMaxLength(200);

            // Composite index: Kullanıcıya ait gönderilmemiş bildirimleri hızlı bulmak için
            builder.HasIndex(x => new { x.UserId, x.IsSent })
                   .HasDatabaseName("IX_NotificationQueue_UserId_IsSent");

            // Unique constraint: Aynı kullanıcı, aynı abonelik, aynı tarih için tekrar bildirim kuyruğa alınamaz
            builder.HasIndex(x => new { x.UserId, x.UserSubscriptionId, x.ScheduledDate })
                   .IsUnique()
                   .HasDatabaseName("UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate");

            builder.ToTable("NotificationQueues");
        }
    }
}
