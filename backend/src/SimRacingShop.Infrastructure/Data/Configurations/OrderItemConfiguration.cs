using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.HasKey(oi => oi.Id);

            builder.Property(oi => oi.ProductName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(oi => oi.ProductSku)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(oi => oi.ConfigurationJson)
                .HasColumnType("jsonb"); // PostgreSQL JSONB

            builder.Property(oi => oi.Quantity)
                .IsRequired();

            builder.Property(oi => oi.UnitPrice)
                .IsRequired()
                .HasPrecision(10, 2);

            builder.Property(oi => oi.LineTotal)
                .IsRequired()
                .HasPrecision(10, 2);

            builder.Property(oi => oi.CreatedAt)
                .IsRequired();

            // Indexes
            builder.HasIndex(oi => oi.OrderId);
            builder.HasIndex(oi => oi.ProductId);

            // Relationships
            builder.HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
