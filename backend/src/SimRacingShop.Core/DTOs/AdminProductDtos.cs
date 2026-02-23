namespace SimRacingShop.Core.DTOs
{
    public record CreateProductDto
    {
        public string Sku { get; init; } = null!;
        public decimal BasePrice { get; init; }
        public decimal VatRate { get; init; } = 21.00m;
        public string? Model3dUrl { get; init; }
        public int? Model3dSizeKb { get; init; }
        public bool IsActive { get; init; } = true;
        public bool IsCustomizable { get; init; } = true;
        public int BaseProductionDays { get; init; } = 7;
        public int? WeightGrams { get; init; }
        public List<ProductTranslationInputDto> Translations { get; init; } = new();
    }

    public record UpdateProductDto
    {
        public decimal BasePrice { get; init; }
        public decimal VatRate { get; init; } = 21.00m;
        public string? Model3dUrl { get; init; }
        public int? Model3dSizeKb { get; init; }
        public bool IsActive { get; init; } = true;
        public bool IsCustomizable { get; init; } = true;
        public int BaseProductionDays { get; init; } = 7;
        public int? WeightGrams { get; init; }
    }

    public record ProductTranslationInputDto
    {
        public string Locale { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
        public string? LongDescription { get; init; }
        public string? MetaTitle { get; init; }
        public string? MetaDescription { get; init; }
    }

    public record UpdateProductTranslationsDto
    {
        public List<ProductTranslationInputDto> Translations { get; init; } = new();
    }

    public record ProductImageUploadResultDto
    {
        public Guid Id { get; init; }
        public string ImageUrl { get; init; } = null!;
        public string? AltText { get; init; }
        public int DisplayOrder { get; init; }
    }
}
