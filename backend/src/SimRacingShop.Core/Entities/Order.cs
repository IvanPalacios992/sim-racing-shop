using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class Order
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public Guid? UserId { get; set; }

        // Shiping
        public string ShippingStreet { get; set; } = null!;
        public string ShippingCity { get; set; } = null!;
        public string? ShippingState { get; set; }
        public string ShippingPostalCode { get; set; } = null!;
        public string ShippingCountry { get; set; } = "ES";

        // Payment
        public Guid? PaymentId { get; set; }

        // Prices
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalAmount { get; set; }

        // Order status
        public string OrderStatus { get; set; } = "pending";

        // Production
        public int? EstimatedProductionDays { get; set; }
        public string? ProductionNotes { get; set; }

        // Shipping
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedAt { get; set; }

        // Metadata
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Payment? Payment { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
