namespace SimRacingShop.Core.DTOs
{
    public record CartItemDto
    {
        public Guid ProductId { get; init; }
        public string Sku { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string? ImageUrl { get; init; }
        public int Quantity { get; init; }
        public decimal UnitPrice { get; init; }
        public decimal VatRate { get; init; }
        public decimal Subtotal { get; init; }
    }

    public record CartDto
    {
        public IReadOnlyList<CartItemDto> Items { get; init; } = [];
        public int TotalItems { get; init; }
        public decimal Subtotal { get; init; }
        public decimal VatAmount { get; init; }
        public decimal Total { get; init; }
    }

    public class AddToCartDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }

    public class MergeCartDto
    {
        public string SessionId { get; set; } = null!;
    }
}
