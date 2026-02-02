using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class ProductSpecificationConfiguration : IEntityTypeConfiguration<ProductSpecification>
    {
        public void Configure(EntityTypeBuilder<ProductSpecification> builder)
        {
            builder.HasKey(ps => ps.Id);

            builder.Property(ps => ps.Locale)
                .IsRequired()
                .HasMaxLength(5);

            builder.Property(ps => ps.SpecKey)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(ps => ps.SpecValue)
                .IsRequired()
                .HasColumnType("text");

            builder.Property(ps => ps.DisplayOrder)
                .HasDefaultValue(0);

            // Indexes
            builder.HasIndex(ps => new { ps.ProductId, ps.Locale });
            builder.HasIndex(ps => new { ps.ProductId, ps.Locale, ps.DisplayOrder });

            // Relationships
            builder.HasOne(ps => ps.Product)
                .WithMany(p => p.Specifications)
                .HasForeignKey(ps => ps.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
