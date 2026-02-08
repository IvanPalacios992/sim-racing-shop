using System.ComponentModel.DataAnnotations;

namespace SimRacingShop.Core.DTOs
{
    public record CreateProductDto
    {
        [Required]
        [StringLength(50)]
        public string Sku { get; init; } = null!;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal BasePrice { get; init; }

        [Range(0, 100)]
        public decimal VatRate { get; init; } = 21.00m;

        public string? Model3dUrl { get; init; }
        public int? Model3dSizeKb { get; init; }
        public bool IsActive { get; init; } = true;
        public bool IsCustomizable { get; init; } = true;

        [Range(1, 365)]
        public int BaseProductionDays { get; init; } = 7;

        public int? WeightGrams { get; init; }

        [Required]
        [MinLength(1)]
        public List<ProductTranslationInputDto> Translations { get; init; } = new();
    }

    public record UpdateProductDto
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal BasePrice { get; init; }

        [Range(0, 100)]
        public decimal VatRate { get; init; } = 21.00m;

        public string? Model3dUrl { get; init; }
        public int? Model3dSizeKb { get; init; }
        public bool IsActive { get; init; } = true;
        public bool IsCustomizable { get; init; } = true;

        [Range(1, 365)]
        public int BaseProductionDays { get; init; } = 7;

        public int? WeightGrams { get; init; }
    }

    public record ProductTranslationInputDto
    {
        [Required]
        [StringLength(5)]
        public string Locale { get; init; } = null!;

        [Required]
        [StringLength(200)]
        public string Name { get; init; } = null!;

        [Required]
        [StringLength(200)]
        public string Slug { get; init; } = null!;

        [StringLength(500)]
        public string? ShortDescription { get; init; }

        public string? LongDescription { get; init; }

        [StringLength(200)]
        public string? MetaTitle { get; init; }

        [StringLength(500)]
        public string? MetaDescription { get; init; }
    }

    public record UpdateTranslationsDto
    {
        [Required]
        [MinLength(1)]
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
