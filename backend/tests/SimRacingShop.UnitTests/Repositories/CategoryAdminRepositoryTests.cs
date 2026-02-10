using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class CategoryAdminRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CategoryAdminRepository _repository;

    public CategoryAdminRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new CategoryAdminRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private Category BuildCategory(
        string locale = "es",
        string name = "Volantes",
        string slug = "volantes")
    {
        return new Category
        {
            Id = Guid.NewGuid(),
            IsActive = true,
            Translations = new List<CategoryTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Categoría de volantes"
                }
            }
        };
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_SavesCategoryToDatabase()
    {
        // Arrange
        var category = BuildCategory();

        // Act
        var result = await _repository.CreateAsync(category);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(category.Id);

        var saved = await _context.Categories.FindAsync(new object[] { category.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_SavesTranslationsWithCategory()
    {
        // Arrange
        var category = BuildCategory();

        // Act
        await _repository.CreateAsync(category);

        // Assert
        var translations = await _context.CategoriesTranslations
            .Where(t => t.CategoryId == category.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(1);
        translations[0].Name.Should().Be("Volantes");
        translations[0].Locale.Should().Be("es");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingCategory_ReturnsCategoryWithIncludes()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);

        var image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            ImageUrl = "/uploads/categories/img1.jpg",
            CreatedAt = DateTime.UtcNow
        };
        _context.CategoriesImages.Add(image);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetByIdAsync(category.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Translations.Should().HaveCount(1);
        result.Image.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesCategoryFields()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        category.IsActive = false;
        category.ParentCategory = Guid.NewGuid();
        await _repository.UpdateAsync(category);

        // Assert
        var updated = await _context.Categories.FindAsync(new object[] { category.Id }, TestContext.Current.CancellationToken);
        updated!.IsActive.Should().BeFalse();
        updated.ParentCategory.Should().NotBeNull();
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_RemovesCategoryFromDatabase()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(category);

        // Assert
        var deleted = await _context.Categories.FindAsync(new object[] { category.Id }, TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_CascadeDeletesTranslations()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(category);

        // Assert
        var translations = await _context.CategoriesTranslations
            .Where(t => t.CategoryId == category.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().BeEmpty();
    }

    #endregion

    #region AddImageAsync Tests

    [Fact]
    public async Task AddImageAsync_AddsImageToCategory()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            ImageUrl = "/uploads/categories/img1.jpg",
            AltText = "Image 1"
        };

        // Act
        var result = await _repository.AddImageAsync(category.Id, image);

        // Assert
        result.Should().NotBeNull();
        result.CategoryId.Should().Be(category.Id);

        var savedImage = await _context.CategoriesImages
            .FirstOrDefaultAsync(i => i.CategoryId == category.Id, TestContext.Current.CancellationToken);

        savedImage.Should().NotBeNull();
        savedImage!.ImageUrl.Should().Be("/uploads/categories/img1.jpg");
    }

    #endregion

    #region ReplaceTranslationsAsync Tests

    [Fact]
    public async Task ReplaceTranslationsAsync_ReplacesExistingTranslations()
    {
        // Arrange
        var category = BuildCategory(locale: "es", name: "Nombre Original", slug: "nombre-original");
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var newTranslations = new List<CategoryTranslation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Locale = "es",
                Name = "Nombre Nuevo",
                Slug = "nombre-nuevo"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Locale = "en",
                Name = "New Name",
                Slug = "new-name"
            }
        };

        // Act
        await _repository.ReplaceTranslationsAsync(category.Id, newTranslations);

        // Assert
        var translations = await _context.CategoriesTranslations
            .Where(t => t.CategoryId == category.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(2);
        translations.Should().Contain(t => t.Name == "Nombre Nuevo" && t.Locale == "es");
        translations.Should().Contain(t => t.Name == "New Name" && t.Locale == "en");
    }

    [Fact]
    public async Task ReplaceTranslationsAsync_RemovesOldTranslations()
    {
        // Arrange
        var category = BuildCategory(locale: "es", name: "Original", slug: "original");
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var originalTranslationId = category.Translations.First().Id;

        var newTranslations = new List<CategoryTranslation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Locale = "en",
                Name = "English Only",
                Slug = "english-only"
            }
        };

        // Act
        await _repository.ReplaceTranslationsAsync(category.Id, newTranslations);

        // Assert
        var oldTranslation = await _context.CategoriesTranslations.FindAsync(new object[] { originalTranslationId }, TestContext.Current.CancellationToken);
        oldTranslation.Should().BeNull();

        var translations = await _context.CategoriesTranslations
            .Where(t => t.CategoryId == category.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(1);
        translations[0].Locale.Should().Be("en");
    }

    #endregion

    #region ParentCategoryExists Tests

    [Fact]
    public async Task ParentCategoryExistsAsync_WithExistingCategory_ReturnsTrue()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.ParentCategoryExistsAsync(category.Id);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ParentCategoryExistsAsync_WithNonExistentCategory_ReturnsFalse()
    {
        // Act
        var result = await _repository.ParentCategoryExistsAsync(Guid.NewGuid());

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ParentCategoryExists_Sync_WithExistingCategory_ReturnsTrue()
    {
        // Arrange
        var category = BuildCategory();
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = _repository.ParentCategoryExists(category.Id);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ParentCategoryExists_Sync_WithNonExistentCategory_ReturnsFalse()
    {
        // Act
        var result = _repository.ParentCategoryExists(Guid.NewGuid());

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}
