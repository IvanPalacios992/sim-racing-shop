using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class CategoryRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CategoryRepository _repository;

    public CategoryRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new CategoryRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    #region Helper Methods

    private async Task<Category> SeedCategory(
        string locale = "es",
        string name = "Volantes",
        string slug = "volantes",
        bool isActive = true,
        DateTime? createdAt = null)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            IsActive = isActive,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };

        _context.Categories.Add(category);

        _context.CategoriesTranslations.Add(new CategoryTranslation
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Locale = locale,
            Name = name,
            Slug = slug,
            ShortDescription = $"Descripción de {name}"
        });

        await _context.SaveChangesAsync();
        return category;
    }

    #endregion

    #region GetCategoriesAsync Tests

    [Fact]
    public async Task GetCategoriesAsync_ReturnsAllCategoriesForLocale()
    {
        // Arrange
        await SeedCategory(name: "Volantes", slug: "volantes");
        await SeedCategory(name: "Pedales", slug: "pedales");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetCategoriesAsync_ExcludesCategoriesWithoutTranslationForLocale()
    {
        // Arrange
        await SeedCategory(locale: "es", name: "Solo Español");

        var filter = new CategoryFilterDto { Locale = "en", IsActive = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetCategoriesAsync_FilterByIsActive_ReturnsOnlyActiveCategories()
    {
        // Arrange
        await SeedCategory(name: "Activa", slug: "activa", isActive: true);
        await SeedCategory(name: "Inactiva", slug: "inactiva", isActive: false);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = true };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Activa");
        result.Items[0].IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetCategoriesAsync_FilterByIsActiveFalse_ReturnsOnlyInactiveCategories()
    {
        // Arrange
        await SeedCategory(name: "Activa", slug: "activa", isActive: true);
        await SeedCategory(name: "Inactiva", slug: "inactiva", isActive: false);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = false };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Inactiva");
        result.Items[0].IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task GetCategoriesAsync_IsActiveNull_ReturnsBothActiveAndInactive()
    {
        // Arrange
        await SeedCategory(name: "Activa", slug: "activa", isActive: true);
        await SeedCategory(name: "Inactiva", slug: "inactiva", isActive: false);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCategoriesAsync_SortByNameAscending_ReturnsSortedCategories()
    {
        // Arrange
        await SeedCategory(name: "Zeta", slug: "zeta");
        await SeedCategory(name: "Alpha", slug: "alpha");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, SortBy = "name", SortDescending = false };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Alpha");
        result.Items[1].Name.Should().Be("Zeta");
    }

    [Fact]
    public async Task GetCategoriesAsync_SortByNameDescending_ReturnsSortedCategories()
    {
        // Arrange
        await SeedCategory(name: "Alpha", slug: "alpha");
        await SeedCategory(name: "Zeta", slug: "zeta");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, SortBy = "name", SortDescending = true };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Zeta");
        result.Items[1].Name.Should().Be("Alpha");
    }

    [Fact]
    public async Task GetCategoriesAsync_SortByNewest_ReturnsMostRecentFirst()
    {
        // Arrange
        var oldest = await SeedCategory(name: "Antigua", slug: "antigua", createdAt: DateTime.UtcNow.AddDays(-5));
        var newest = await SeedCategory(name: "Nueva", slug: "nueva", createdAt: DateTime.UtcNow);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, SortBy = "newest" };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items[0].Id.Should().Be(newest.Id);
        result.Items[1].Id.Should().Be(oldest.Id);
    }

    [Fact]
    public async Task GetCategoriesAsync_UnknownSortBy_DefaultsToNewest()
    {
        // Arrange
        await SeedCategory(name: "Antigua", slug: "antigua", createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedCategory(name: "Nueva", slug: "nueva", createdAt: DateTime.UtcNow);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, SortBy = "unknown" };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Nueva");
        result.Items[1].Name.Should().Be("Antigua");
    }

    [Fact]
    public async Task GetCategoriesAsync_NullSortBy_DefaultsToNewest()
    {
        // Arrange
        await SeedCategory(name: "Antigua", slug: "antigua", createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedCategory(name: "Nueva", slug: "nueva", createdAt: DateTime.UtcNow);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, SortBy = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Nueva");
        result.Items[1].Name.Should().Be("Antigua");
    }

    [Fact]
    public async Task GetCategoriesAsync_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        for (int i = 0; i < 5; i++)
            await SeedCategory(name: $"Categoria {i}", slug: $"categoria-{i}");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, Page = 2, PageSize = 2 };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public async Task GetCategoriesAsync_ClampsPageSizeTo50()
    {
        // Arrange
        await SeedCategory(name: "Volantes", slug: "volantes");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, PageSize = 100 };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.PageSize.Should().Be(50);
    }

    [Fact]
    public async Task GetCategoriesAsync_ClampsPageToMinimum1()
    {
        // Arrange
        await SeedCategory(name: "Volantes", slug: "volantes");

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null, Page = 0 };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Page.Should().Be(1);
    }

    [Fact]
    public async Task GetCategoriesAsync_NullOrEmptySearch_ReturnsAllResults()
    {
        // Arrange
        await SeedCategory(name: "Volantes", slug: "volantes");
        await SeedCategory(name: "Pedales", slug: "pedales");

        var filterNull = new CategoryFilterDto { Locale = "es", IsActive = null, Search = null };
        var filterEmpty = new CategoryFilterDto { Locale = "es", IsActive = null, Search = "" };
        var filterWhitespace = new CategoryFilterDto { Locale = "es", IsActive = null, Search = "   " };

        // Act
        var resultNull = await _repository.GetCategoriesAsync(filterNull);
        var resultEmpty = await _repository.GetCategoriesAsync(filterEmpty);
        var resultWhitespace = await _repository.GetCategoriesAsync(filterWhitespace);

        // Assert
        resultNull.Items.Should().HaveCount(2);
        resultEmpty.Items.Should().HaveCount(2);
        resultWhitespace.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCategoriesAsync_ReturnsEmptyWhenNoCategoriesExist()
    {
        // Arrange
        var filter = new CategoryFilterDto { Locale = "es", IsActive = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task GetCategoriesAsync_MapsAllFieldsCorrectly()
    {
        // Arrange
        var category = await SeedCategory(name: "Volantes", slug: "volantes-es", isActive: true);

        var image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            ImageUrl = "/img/volantes.jpg",
            AltText = "Volantes",
            CreatedAt = DateTime.UtcNow
        };
        _context.CategoriesImages.Add(image);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var filter = new CategoryFilterDto { Locale = "es", IsActive = null };

        // Act
        var result = await _repository.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        var item = result.Items[0];
        item.Id.Should().Be(category.Id);
        item.Name.Should().Be("Volantes");
        item.Slug.Should().Be("volantes-es");
        item.IsActive.Should().BeTrue();
        item.ImageUrl.Should().Be("/img/volantes.jpg");
    }

    #endregion

    #region GetCategoryByIdAsync Tests

    [Fact]
    public async Task GetCategoryByIdAsync_WithExistingId_ReturnsCategoryDetail()
    {
        // Arrange
        var category = await SeedCategory(name: "Volantes", slug: "volantes");

        // Act
        var result = await _repository.GetCategoryByIdAsync(category.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(category.Id);
        result.Name.Should().Be("Volantes");
        result.Slug.Should().Be("volantes");
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetCategoryByIdAsync(Guid.NewGuid(), "es");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithWrongLocale_ReturnsNull()
    {
        // Arrange
        var category = await SeedCategory(locale: "es", name: "Volantes", slug: "volantes");

        // Act
        var result = await _repository.GetCategoryByIdAsync(category.Id, "en");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithImage_IncludesImageData()
    {
        // Arrange
        var category = await SeedCategory(name: "Volantes", slug: "volantes");

        var image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            ImageUrl = "/img/volantes.jpg",
            AltText = "Imagen de volantes",
            CreatedAt = DateTime.UtcNow
        };
        _context.CategoriesImages.Add(image);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetCategoryByIdAsync(category.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Image.Should().NotBeNull();
        result.Image.ImageUrl.Should().Be("/img/volantes.jpg");
        result.Image.AltText.Should().Be("Imagen de volantes");
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithoutImage_ReturnsEmptyImageDto()
    {
        // Arrange
        var category = await SeedCategory(name: "Volantes", slug: "volantes");

        // Act
        var result = await _repository.GetCategoryByIdAsync(category.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Image.Should().NotBeNull();
        result.Image.ImageUrl.Should().BeNull();
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WithParentCategory_IncludesParentId()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var category = new Category
        {
            Id = Guid.NewGuid(),
            IsActive = true,
            ParentCategory = parentId,
            CreatedAt = DateTime.UtcNow
        };
        _context.Categories.Add(category);
        _context.CategoriesTranslations.Add(new CategoryTranslation
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Locale = "es",
            Name = "Subcategoría",
            Slug = "subcategoria"
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetCategoryByIdAsync(category.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.ParentCategory.Should().Be(parentId);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_MapsIsActiveCorrectly()
    {
        // Arrange
        var active = await SeedCategory(name: "Activa", slug: "activa", isActive: true);
        var inactive = await SeedCategory(name: "Inactiva", slug: "inactiva", isActive: false);

        // Act
        var resultActive = await _repository.GetCategoryByIdAsync(active.Id, "es");
        var resultInactive = await _repository.GetCategoryByIdAsync(inactive.Id, "es");

        // Assert
        resultActive!.IsActive.Should().BeTrue();
        resultInactive!.IsActive.Should().BeFalse();
    }

    #endregion
}
