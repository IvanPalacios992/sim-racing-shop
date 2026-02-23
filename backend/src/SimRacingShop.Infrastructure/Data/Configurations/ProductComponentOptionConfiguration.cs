using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class ProductComponentOptionConfiguration : IEntityTypeConfiguration<ProductComponentOption>
    {
        public void Configure(EntityTypeBuilder<ProductComponentOption> builder)
        {
            builder.HasKey(pco => pco.Id);

            builder.Property(pco => pco.OptionGroup)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(pco => pco.IsGroupRequired)
                .HasDefaultValue(false);

            builder.Property(pco => pco.GlbObjectName)
                .HasMaxLength(100);

            builder.Property(pco => pco.ThumbnailUrl)
                .HasMaxLength(500);

            builder.Property(pco => pco.PriceModifier)
                .HasPrecision(10, 2)
                .HasDefaultValue(0.00m);

            builder.Property(pco => pco.IsDefault)
                .HasDefaultValue(false);

            builder.Property(pco => pco.DisplayOrder)
                .HasDefaultValue(0);

            // Unique constraint: one component per product
            builder.HasIndex(pco => new { pco.ProductId, pco.ComponentId })
                .IsUnique();

            // Indexes
            builder.HasIndex(pco => pco.ProductId);
            builder.HasIndex(pco => pco.OptionGroup);

            // Relationships
            builder.HasOne(pco => pco.Product)
                .WithMany(p => p.ComponentOptions)
                .HasForeignKey(pco => pco.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pco => pco.Component)
                .WithMany(c => c.ProductComponentOptions)
                .HasForeignKey(pco => pco.ComponentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
