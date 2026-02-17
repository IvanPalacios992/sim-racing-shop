using System;
using System.Collections.Generic;

namespace SimRacingShop.Core.DTOs
{
    // DTO para crear un item de pedido
    public class CreateOrderItemDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string ProductSku { get; set; } = null!;
        public string? ConfigurationJson { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    // DTO para crear un pedido
    public class CreateOrderDto
    {
        public string ShippingStreet { get; set; } = null!;
        public string ShippingCity { get; set; } = null!;
        public string? ShippingState { get; set; }
        public string ShippingPostalCode { get; set; } = null!;
        public string ShippingCountry { get; set; } = "ES";

        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalAmount { get; set; }

        public string? Notes { get; set; }

        public ICollection<CreateOrderItemDto> OrderItems { get; set; } = new List<CreateOrderItemDto>();
    }

    // DTO para item de pedido en respuestas
    public class OrderItemDetailDto
    {
        public Guid Id { get; set; }
        public Guid? ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string ProductSku { get; set; } = null!;
        public string? ConfigurationJson { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    // DTO para detalle de pedido
    public class OrderDetailDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public Guid? UserId { get; set; }

        // Shipping
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

        // Status
        public string OrderStatus { get; set; } = "pending";

        // Production
        public int? EstimatedProductionDays { get; set; }
        public string? ProductionNotes { get; set; }

        // Shipping tracking
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedAt { get; set; }

        // Metadata
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Items
        public ICollection<OrderItemDetailDto> OrderItems { get; set; } = new List<OrderItemDetailDto>();
    }

    // DTO para listado de pedidos (versión resumida)
    public class OrderSummaryDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "pending";
        public DateTime CreatedAt { get; set; }
        public ICollection<OrderItemSummaryDto> Items { get; set; } = new List<OrderItemSummaryDto>();
    }

    // DTO para listado de pedidos (versión resumida)
    public class OrderItemSummaryDto
    {
        public Guid Id { get; set; }
        public string ProductName { get; set; } = null!;
        public string ProductSku { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
