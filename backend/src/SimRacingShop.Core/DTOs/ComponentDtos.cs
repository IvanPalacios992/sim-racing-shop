namespace SimRacingShop.Core.DTOs
{
    public record ComponentListItemDto
    {
        public Guid Id { get; init; }
        public string Sku { get; init; } = null!;
        public string ComponentType { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string? Description { get; init; }
        public int StockQuantity { get; init; }
        public bool InStock { get; init; }
        public int? WeightGrams { get; init; }
    }

    public record ProductComponentOptionDto
    {
        public Guid ComponentId { get; init; }
        public string Sku { get; init; } = null!;
        public string ComponentType { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string? Description { get; init; }
        public string OptionGroup { get; init; } = null!;
        public bool IsGroupRequired { get; init; }
        public string? GlbObjectName { get; init; }
        public string? ThumbnailUrl { get; init; }
        public decimal PriceModifier { get; init; }
        public bool IsDefault { get; init; }
        public int DisplayOrder { get; init; }
        public int StockQuantity { get; init; }
        public bool InStock { get; init; }
    }

    public record ComponentFilterDto
    {
        public string? Search { get; init; }
        public string? ComponentType { get; init; }
        public bool? InStock { get; init; }
        public string Locale { get; init; } = "es";
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 12;
    }

    // ── ProductComponentOption admin DTOs ──────────────────────────────────────

    /// <summary>Cuerpo de petición para crear o actualizar una vinculación producto-componente.</summary>
    public record UpsertProductComponentOptionDto
    {
        public Guid ComponentId { get; init; }
        public string OptionGroup { get; init; } = null!;
        public bool IsGroupRequired { get; init; }
        public string? GlbObjectName { get; init; }
        public string? ThumbnailUrl { get; init; }
        public decimal PriceModifier { get; init; }
        public bool IsDefault { get; init; }
        public int DisplayOrder { get; init; }
    }

    /// <summary>Respuesta de un registro ProductComponentOption con datos del componente.</summary>
    public record ProductComponentOptionAdminDto
    {
        public Guid Id { get; init; }
        public Guid ProductId { get; init; }
        public Guid ComponentId { get; init; }
        public string ComponentSku { get; init; } = null!;
        public string OptionGroup { get; init; } = null!;
        public bool IsGroupRequired { get; init; }
        public string? GlbObjectName { get; init; }
        public string? ThumbnailUrl { get; init; }
        public decimal PriceModifier { get; init; }
        public bool IsDefault { get; init; }
        public int DisplayOrder { get; init; }
    }
}
