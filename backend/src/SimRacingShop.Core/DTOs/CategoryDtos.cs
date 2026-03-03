namespace SimRacingShop.Core.DTOs
{
    public record CategoryListItemDto
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
        public string? ImageUrl { get; init; }
        public bool IsActive { get; init; }
    }

    public record CategoryDetailDto
    {
        public Guid Id { get; init; }
        public Guid? ParentCategory { get; set; }
        public string Name { get; init; } = null!;
        public string Slug { get; init; } = null!;
        public string? ShortDescription { get; init; }
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
        public CategoryImageDto Image { get; init; } = new();
    }

    public record CategoryImageDto
    {
        public Guid Id { get; init; }
        public string ImageUrl { get; init; } = null!;
        public string? AltText { get; init; }
    }

    public record CategoryFilterDto
    {
        public bool? IsActive { get; init; } = true;
        public string Locale { get; init; } = "es";
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 12;
        public string? SortBy { get; init; }
        public bool SortDescending { get; init; }
        public string? Search { get; init; }
    }
}
