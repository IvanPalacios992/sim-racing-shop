using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class CategoryImageConfiguration : IEntityTypeConfiguration<CategoryImage>
    {
        public void Configure(EntityTypeBuilder<CategoryImage> builder)
        {
            builder.HasKey(pi => pi.Id);

            builder.Property(pi => pi.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(pi => pi.AltText)
                .HasMaxLength(255);

            builder.Property(pi => pi.CreatedAt)
                .IsRequired();

            // Indexes
            builder.HasIndex(pi => pi.CategoryId);

            // Relationships
            builder.HasOne(ci => ci.Category)
                .WithOne(i => i.Image)
                .HasForeignKey<CategoryImage>(ci => ci.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
