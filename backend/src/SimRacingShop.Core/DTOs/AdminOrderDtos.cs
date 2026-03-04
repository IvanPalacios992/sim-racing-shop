using System;

namespace SimRacingShop.Core.DTOs
{
    public class AdminOrderSummaryDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string? UserEmail { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "pending";
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = null!;
    }

    public class AdminOrderDetailDto : OrderDetailDto
    {
        public string? UserEmail { get; set; }
    }
}
