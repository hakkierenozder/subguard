using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubGuard.Core.Entities;

namespace SubGuard.Data.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            builder.Property(x => x.Code).IsRequired();
            builder.Property(x => x.UserId).IsRequired();

            // Index: Token kodu ile hızlı arama
            builder.HasIndex(x => x.Code)
                   .HasDatabaseName("IX_RefreshTokens_Code");

            // Unique constraint: Aynı (Code, UserId) çifti tekrar edemez
            builder.HasIndex(x => new { x.Code, x.UserId })
                   .IsUnique()
                   .HasDatabaseName("UQ_RefreshTokens_Code_UserId");

            builder.ToTable("RefreshTokens");
        }
    }
}
