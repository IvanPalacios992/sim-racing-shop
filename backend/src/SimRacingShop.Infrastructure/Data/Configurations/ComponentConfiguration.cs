using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class ComponentConfiguration : IEntityTypeConfiguration<Component>
    {
        public void Configure(EntityTypeBuilder<Component> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Sku)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(c => c.Sku)
                .IsUnique();

            builder.Property(c => c.ComponentType)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(c => c.ComponentType);

            builder.Property(c => c.StockQuantity)
                .HasDefaultValue(0);

            builder.HasIndex(c => c.StockQuantity);

            builder.Property(c => c.MinStockThreshold)
                .HasDefaultValue(5);

            builder.Property(c => c.LeadTimeDays)
                .HasDefaultValue(0);

            builder.Property(c => c.CostPrice)
                .HasPrecision(10, 2);

            // Composite index for low stock queries
            builder.HasIndex(c => new { c.ComponentType, c.StockQuantity });

            // Relationships
            builder.HasMany(c => c.Translations)
                .WithOne(t => t.Component)
                .HasForeignKey(t => t.ComponentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.ProductComponentOptions)
                .WithOne(pco => pco.Component)
                .HasForeignKey(pco => pco.ComponentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
