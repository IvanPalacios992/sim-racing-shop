using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class UserCommunicationPreferencesConfiguration : IEntityTypeConfiguration<UserCommunicationPreferences>
    {
        public void Configure(EntityTypeBuilder<UserCommunicationPreferences> builder)
        {
            builder.HasKey(ucp => ucp.Id);

            builder.Property(ucp => ucp.Newsletter)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ucp => ucp.OrderNotifications)
                .IsRequired()
                .HasDefaultValue(true); // Por defecto activo para notificaciones de pedidos

            builder.Property(ucp => ucp.SmsPromotions)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ucp => ucp.CreatedAt)
                .IsRequired();

            builder.Property(ucp => ucp.UpdatedAt)
                .IsRequired();

            // Indexes
            builder.HasIndex(ucp => ucp.UserId)
                .IsUnique(); // Solo un registro de preferencias por usuario

            // Relationships
            builder.HasOne(ucp => ucp.User)
                .WithOne(u => u.CommunicationPreferences)
                .HasForeignKey<UserCommunicationPreferences>(ucp => ucp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
