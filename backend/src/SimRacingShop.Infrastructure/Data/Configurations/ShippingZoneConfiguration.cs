using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class ShippingZoneConfiguration : IEntityTypeConfiguration<ShippingZone>
    {
        public void Configure(EntityTypeBuilder<ShippingZone> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.PostalCodePrefixes)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(e => e.BaseCost)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(e => e.CostPerKg)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(e => e.FreeShippingThreshold)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(e => e.CreatedAt)
                .IsRequired();

            builder.Property(e => e.UpdatedAt)
                .IsRequired();

            // Índices
            builder.HasIndex(e => e.Name)
                .HasDatabaseName("IX_ShippingZone_Name");

            builder.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_ShippingZone_IsActive");

            // Índice compuesto para búsquedas activas por nombre
            builder.HasIndex(e => new { e.IsActive, e.Name })
                .HasDatabaseName("IX_ShippingZone_IsActive_Name");

            // Nombre de tabla
            builder.ToTable("ShippingZones");
        }
    }
}
