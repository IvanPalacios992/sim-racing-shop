using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid? UserId { get; set; }

        public string? PaymentMethod { get; set; }
        public string PaymentStatus { get; set; } = "pending";
        public string? PaymentTransactionId { get; set; }

        public decimal Amount { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Order Order { get; set; } = null!;
    }
}
