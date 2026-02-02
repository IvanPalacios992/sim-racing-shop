using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.OrderNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.ShippingStreet)
           .IsRequired()
           .HasMaxLength(500);

            builder.Property(e => e.ShippingCity)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.ShippingState)
                .HasMaxLength(100);

            builder.Property(e => e.ShippingPostalCode)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(e => e.ShippingCountry)
                .IsRequired()
                .HasMaxLength(2)
                .HasDefaultValue("ES");

            builder.Property(e => e.Subtotal)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(e => e.VatAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(e => e.ShippingCost)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(e => e.TotalAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(e => e.OrderStatus)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("pending");

            builder.Property(e => e.EstimatedProductionDays);

            builder.Property(e => e.ProductionNotes)
                .HasMaxLength(2000);

            builder.Property(e => e.TrackingNumber)
                .HasMaxLength(100);

            builder.Property(e => e.ShippedAt);

            builder.Property(e => e.Notes)
                .HasMaxLength(2000);

            builder.Property(e => e.CreatedAt)
                .IsRequired();

            builder.Property(e => e.UpdatedAt)
                .IsRequired();


            // Relación con Payment (1:1)
            builder.HasOne(e => e.Payment)
                .WithOne(p => p.Order)
                .HasForeignKey<Payment>(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Relación con User
            builder.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Relación con OrderItems
            builder.HasMany(e => e.OrderItems)
                .WithOne()
                .HasForeignKey("OrderId")
                .OnDelete(DeleteBehavior.Cascade);

            // Índices
            builder.HasIndex(e => e.OrderNumber)
                .IsUnique()
                .HasDatabaseName("IX_Order_OrderNumber");

            builder.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Order_UserId");

            builder.HasIndex(e => e.OrderStatus)
                .HasDatabaseName("IX_Order_OrderStatus");

            builder.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Order_CreatedAt");

            // Nombre de tabla
            builder.ToTable("Orders");
        }
    }
}
