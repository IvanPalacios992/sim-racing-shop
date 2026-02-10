using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.IsActive)
                .HasDefaultValue(true);

            builder.HasIndex(p => p.IsActive);

            // Relationships
            builder.HasMany(p => p.Translations)
                .WithOne(t => t.Category)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Image)
                .WithOne(i => i.Category)
                .HasForeignKey<CategoryImage>(i => i.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
