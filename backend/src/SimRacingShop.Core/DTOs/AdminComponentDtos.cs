namespace SimRacingShop.Core.DTOs
{
    public record CreateComponentDto
    {
        public string Sku { get; init; } = null!;
        public string ComponentType { get; init; } = null!;
        public int StockQuantity { get; init; }
        public int MinStockThreshold { get; init; } = 5;
        public int LeadTimeDays { get; init; }
        public int? WeightGrams { get; init; }
        public decimal? CostPrice { get; init; }
        public List<ComponentTranslationInputDto> Translations { get; init; } = new();
    }

    public record UpdateComponentDto
    {
        public string ComponentType { get; init; } = null!;
        public int StockQuantity { get; init; }
        public int MinStockThreshold { get; init; } = 5;
        public int LeadTimeDays { get; init; }
        public int? WeightGrams { get; init; }
        public decimal? CostPrice { get; init; }
    }

    public record ComponentTranslationInputDto
    {
        public string Locale { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string? Description { get; init; }
    }

    public record UpdateComponentTranslationsDto
    {
        public List<ComponentTranslationInputDto> Translations { get; init; } = new();
    }

    public record UpdateStockDto
    {
        public int Quantity { get; init; }
    }

    public record ComponentDetailDto
    {
        public Guid Id { get; init; }
        public string Sku { get; init; } = null!;
        public string ComponentType { get; init; } = null!;
        public int StockQuantity { get; init; }
        public bool InStock { get; init; }
        public int MinStockThreshold { get; init; }
        public bool LowStock { get; init; }
        public int LeadTimeDays { get; init; }
        public int? WeightGrams { get; init; }
        public decimal? CostPrice { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public List<ComponentTranslationDto> Translations { get; init; } = new();
    }

    public record ComponentTranslationDto
    {
        public Guid Id { get; init; }
        public string Locale { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string? Description { get; init; }
    }
}
