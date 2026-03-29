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

            // Unique constraint: Aynı kullanıcı, aynı abonelik, aynı tarih ve aynı bildirim türü için tekrar bildirim kuyruğa alınamaz.
            // Type eklendi: Aynı tarihte hem Payment hem Contract bildirimi kuyruğa alınabilmeli.
            builder.HasIndex(x => new { x.UserId, x.UserSubscriptionId, x.ScheduledDate, x.Type })
                   .IsUnique()
                   .HasDatabaseName("UQ_NotificationQueue_UserId_SubscriptionId_ScheduledDate_Type");

            builder.ToTable("NotificationQueues");
        }
    }
}
