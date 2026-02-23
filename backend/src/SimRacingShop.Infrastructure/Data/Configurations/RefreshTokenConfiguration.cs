using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                .IsRequired()
                .HasMaxLength(256);

            builder.HasIndex(rt => rt.Token)
                .IsUnique();

            builder.Property(rt => rt.ExpiresAt)
                .IsRequired();

            builder.Property(rt => rt.CreatedAt)
                .IsRequired();

            builder.Property(rt => rt.ReplacedByToken)
                .HasMaxLength(256);

            // Relationship with User
            builder.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index for faster queries
            builder.HasIndex(rt => rt.UserId);
            builder.HasIndex(rt => new { rt.UserId, rt.RevokedAt, rt.ExpiresAt });
        }
    }
}
