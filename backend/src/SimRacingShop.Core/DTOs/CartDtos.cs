namespace SimRacingShop.Core.DTOs
{
    public record SelectedOptionDto
    {
        public string GroupName { get; init; } = null!;
        public string ComponentId { get; init; } = null!;
        public string ComponentName { get; init; } = null!;
    }

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
        public IReadOnlyList<SelectedOptionDto>? SelectedOptions { get; init; }
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

        /// <summary>
        /// IDs de los componentes seleccionados en el configurador 3D.
        /// El backend suma sus PriceModifier para calcular el precio unitario real.
        /// </summary>
        public List<Guid>? SelectedComponentIds { get; set; }

        /// <summary>
        /// Opciones seleccionadas con nombre de grupo y nombre de componente,
        /// para mostrarlas en el carrito sin necesidad de reconstruirlas desde la BD.
        /// </summary>
        public List<SelectedOptionDto>? SelectedOptions { get; set; }
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
