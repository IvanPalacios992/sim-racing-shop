using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid? ProductId { get; set; }

        // Snapshot
        public string ProductName { get; set; } = null!;
        public string ProductSku { get; set; } = null!;
        public string? ConfigurationJson { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Product? Product { get; set; }
    }
}
