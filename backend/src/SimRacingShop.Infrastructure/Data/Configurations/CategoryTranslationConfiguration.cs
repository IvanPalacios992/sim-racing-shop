using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class CategoryTranslationConfiguration : IEntityTypeConfiguration<CategoryTranslation>
    {
        public void Configure(EntityTypeBuilder<CategoryTranslation> builder)
        {
            builder.HasKey(pt => pt.Id);

            builder.Property(pt => pt.Locale)
                .IsRequired()
                .HasMaxLength(5);

            builder.Property(pt => pt.Name)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(pt => pt.ShortDescription)
                .HasMaxLength(500);

            builder.Property(pt => pt.Slug)
                .IsRequired()
                .HasMaxLength(255);

            // Unique constraints
            builder.HasIndex(pt => new { pt.CategoryId, pt.Locale })
                .IsUnique();

            builder.HasIndex(pt => new { pt.Locale, pt.Slug })
                .IsUnique();
        }
    }
}
