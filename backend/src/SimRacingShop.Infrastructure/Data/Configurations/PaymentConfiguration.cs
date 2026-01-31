using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.PaymentMethod)
                .HasMaxLength(50);

            builder.Property(e => e.PaymentStatus)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("pending");

            builder.Property(e => e.PaymentTransactionId)
                .HasMaxLength(255);

            builder.Property(e => e.Amount)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.Property(e => e.PaidAt);

            builder.Property(e => e.CreatedAt)
                .IsRequired();

            builder.Property(e => e.UpdatedAt)
                .IsRequired();

            // Relación con Order (ya configurada en OrderConfiguration pero se puede reforzar aquí)
            builder.HasOne(e => e.Order)
                .WithOne(o => o.Payment)
                .HasForeignKey<Payment>(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación con User
            builder.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Índices
            builder.HasIndex(e => e.OrderId)
                .IsUnique()
                .HasDatabaseName("IX_Payment_OrderId");

            builder.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Payment_UserId");

            builder.HasIndex(e => e.PaymentStatus)
                .HasDatabaseName("IX_Payment_PaymentStatus");

            builder.HasIndex(e => e.PaymentTransactionId)
                .HasDatabaseName("IX_Payment_TransactionId");

            builder.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Payment_CreatedAt");

            builder.HasIndex(e => new { e.PaymentStatus, e.CreatedAt })
                .HasDatabaseName("IX_Payment_Status_CreatedAt");

            // Nombre de tabla
            builder.ToTable("Payments");
        }
    }
}
