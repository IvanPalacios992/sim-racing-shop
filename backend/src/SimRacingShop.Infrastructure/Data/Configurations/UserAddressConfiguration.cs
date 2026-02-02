using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SimRacingShop.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Data.Configurations
{
    public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
    {
        public void Configure(EntityTypeBuilder<UserAddress> builder)
        {
            builder.HasKey(ua => ua.Id);

            builder.Property(ua => ua.AddressType)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(ua => ua.Street)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(ua => ua.City)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(ua => ua.State)
                .HasMaxLength(100);

            builder.Property(ua => ua.PostalCode)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(ua => ua.Country)
                .IsRequired()
                .HasMaxLength(2)
                .HasDefaultValue("ES");

            builder.Property(ua => ua.IsDefault)
                .HasDefaultValue(false);

            builder.Property(ua => ua.CreatedAt)
                .IsRequired();

            // Indexes
            builder.HasIndex(ua => ua.UserId);
            // Índice parcial para asegurar solo una dirección por defecto por usuario
            builder.HasIndex(e => new { e.UserId, e.IsDefault })
                .HasDatabaseName("IX_ShippingAddress_UserId_IsDefault")
                .HasFilter("\"IsDefault\" = true"); // Sintaxis correcta para PostgreSQL

            // Relationships
            builder.HasOne(ua => ua.User)
                .WithMany(u => u.Addresses)
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
