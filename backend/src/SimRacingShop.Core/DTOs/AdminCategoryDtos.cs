namespace SimRacingShop.Core.DTOs
{
    public record CreateCategoryDto
    {
        public Guid? ParentCategory { get; set; }
        public bool IsActive { get; init; } = true;
        public List<CategoryTranslationInputDto> Translations { get; init; } = new();
    }

    public record UpdateCategoryDto
    {
        public Guid? ParentCategory { get; set; }
        public bool IsActive { get; init; } = true;
    }

    public record CategoryTranslationInputDto
    {
        public string Locale { get; init; } = null!;
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
    }

    public record UpdateCategoryTranslationsDto
    {
        public List<CategoryTranslationInputDto> Translations { get; init; } = new();
    }

    public record CategoryImageUploadResultDto
    {
        public Guid Id { get; init; }
        public string ImageUrl { get; init; } = null!;
        public string? AltText { get; init; }
    }
}
