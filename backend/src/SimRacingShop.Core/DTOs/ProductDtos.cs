namespace SimRacingShop.Core.DTOs
{
    public record ProductListItemDto
    {
        public Guid Id { get; init; }
        public string Sku { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
        public decimal BasePrice { get; init; }
        public decimal VatRate { get; init; }
        public string? ImageUrl { get; init; }
        public bool IsActive { get; init; }
        public bool IsCustomizable { get; init; }
    }

    public record ProductDetailDto
    {
        public Guid Id { get; init; }
        public string Sku { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
        public string? LongDescription { get; init; }
        public decimal BasePrice { get; init; }
        public decimal VatRate { get; init; }
        public string? MetaTitle { get; init; }
        public string? MetaDescription { get; init; }
        public string? Model3dUrl { get; init; }
        public int? Model3dSizeKb { get; init; }
        public bool IsActive { get; init; }
        public bool IsCustomizable { get; init; }
        public int BaseProductionDays { get; init; }
        public int? WeightGrams { get; init; }
        public DateTime CreatedAt { get; init; }
        public List<ProductImageDto> Images { get; init; } = new();
        public List<ProductSpecificationDto> Specifications { get; init; } = new();
    }

    public record ProductImageDto
    {
        public Guid Id { get; init; }
        public string ImageUrl { get; init; } = null!;
        public string? AltText { get; init; }
        public int DisplayOrder { get; init; }
    }

    public record ProductSpecificationDto
    {
        public string SpecKey { get; init; } = null!;
        public string SpecValue { get; init; } = null!;
        public int DisplayOrder { get; init; }
    }

    public record ProductFilterDto
    {
        public string? Search { get; init; }
        public decimal? MinPrice { get; init; }
        public decimal? MaxPrice { get; init; }
        public bool? IsActive { get; init; } = true;
        public bool? IsCustomizable { get; init; }
        public string Locale { get; init; } = "es";
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 12;
        public string? SortBy { get; init; }
        public bool SortDescending { get; init; }
    }
}
