using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class ProductAdminRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly ProductAdminRepository _repository;

    public ProductAdminRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new ProductAdminRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private Product BuildProduct(
        string sku = "SKU-001",
        string locale = "es",
        string name = "Volante F1",
        string slug = "volante-f1")
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            BasePrice = 299.99m,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 7,
            Translations = new List<ProductTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Volante de competición"
                }
            }
        };
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_SavesProductToDatabase()
    {
        // Arrange
        var product = BuildProduct();

        // Act
        var result = await _repository.CreateAsync(product);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(product.Id);

        var saved = await _context.Products.FindAsync(new object[] { product.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.Sku.Should().Be("SKU-001");
    }

    [Fact]
    public async Task CreateAsync_SavesTranslationsWithProduct()
    {
        // Arrange
        var product = BuildProduct();

        // Act
        await _repository.CreateAsync(product);

        // Assert
        var translations = await _context.ProductTranslations
            .Where(t => t.ProductId == product.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(1);
        translations[0].Name.Should().Be("Volante F1");
        translations[0].Locale.Should().Be("es");
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtTimestamp()
    {
        // Arrange
        var product = BuildProduct();

        // Act
        await _repository.CreateAsync(product);

        // Assert
        var saved = await _context.Products.FindAsync(new object[] { product.Id }, TestContext.Current.CancellationToken);
        saved!.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingProduct_ReturnsProductWithIncludes()
    {
        // Arrange
        var product = BuildProduct();
        _context.Products.Add(product);

        var image = new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            ImageUrl = "/uploads/products/img1.jpg",
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow
        };
        _context.ProductImages.Add(image);

        var spec = new ProductSpecification
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Locale = "es",
            SpecKey = "Material",
            SpecValue = "Fibra de carbono",
            DisplayOrder = 1
        };
        _context.ProductSpecifications.Add(spec);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetByIdAsync(product.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Translations.Should().HaveCount(1);
        result.Images.Should().HaveCount(1);
        result.Specifications.Should().HaveCount(1);
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
    public async Task UpdateAsync_UpdatesProductFields()
    {
        // Arrange
        var product = BuildProduct();
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        product.BasePrice = 499.99m;
        product.IsActive = false;
        await _repository.UpdateAsync(product);

        // Assert
        var updated = await _context.Products.FindAsync(new object[] { product.Id }, TestContext.Current.CancellationToken);
        updated!.BasePrice.Should().Be(499.99m);
        updated.IsActive.Should().BeFalse();
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_RemovesProductFromDatabase()
    {
        // Arrange
        var product = BuildProduct();
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(product);

        // Assert
        var deleted = await _context.Products.FindAsync(new object[] { product.Id }, TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_CascadeDeletesTranslations()
    {
        // Arrange
        var product = BuildProduct();
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(product);

        // Assert
        var translations = await _context.ProductTranslations
            .Where(t => t.ProductId == product.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().BeEmpty();
    }

    #endregion

    #region AddImagesAsync Tests

    [Fact]
    public async Task AddImagesAsync_AddsImagesToProduct()
    {
        // Arrange
        var product = BuildProduct();
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var images = new List<ProductImage>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ImageUrl = "/uploads/products/img1.jpg",
                AltText = "Image 1",
                DisplayOrder = 1
            },
            new()
            {
                Id = Guid.NewGuid(),
                ImageUrl = "/uploads/products/img2.jpg",
                AltText = "Image 2",
                DisplayOrder = 2
            }
        };

        // Act
        var result = await _repository.AddImagesAsync(product.Id, images);

        // Assert
        result.Should().HaveCount(2);

        var savedImages = await _context.ProductImages
            .Where(i => i.ProductId == product.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        savedImages.Should().HaveCount(2);
        savedImages.Should().AllSatisfy(i => i.ProductId.Should().Be(product.Id));
    }

    #endregion

    #region SkuExistsAsync Tests

    [Fact]
    public async Task SkuExistsAsync_WithExistingSku_ReturnsTrue()
    {
        // Arrange
        var product = BuildProduct(sku: "SKU-EXISTS");
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.SkuExistsAsync("SKU-EXISTS");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SkuExistsAsync_WithNonExistentSku_ReturnsFalse()
    {
        // Act
        var result = await _repository.SkuExistsAsync("SKU-NONEXISTENT");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void SkuExists_WithExistingSku_ReturnsTrue()
    {
        // Arrange
        var product = BuildProduct(sku: "SKU-SYNC-EXISTS");
        _context.Products.Add(product);
        _context.SaveChanges();

        // Act
        var result = _repository.SkuExists("SKU-SYNC-EXISTS");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void SkuExists_WithNonExistentSku_ReturnsFalse()
    {
        // Act
        var result = _repository.SkuExists("SKU-SYNC-NONEXISTENT");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ReplaceTranslationsAsync Tests

    [Fact]
    public async Task ReplaceTranslationsAsync_ReplacesExistingTranslations()
    {
        // Arrange
        var product = BuildProduct(locale: "es", name: "Nombre Original", slug: "nombre-original");
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var newTranslations = new List<ProductTranslation>
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
        await _repository.ReplaceTranslationsAsync(product.Id, newTranslations);

        // Assert
        var translations = await _context.ProductTranslations
            .Where(t => t.ProductId == product.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(2);
        translations.Should().Contain(t => t.Name == "Nombre Nuevo" && t.Locale == "es");
        translations.Should().Contain(t => t.Name == "New Name" && t.Locale == "en");
    }

    [Fact]
    public async Task ReplaceTranslationsAsync_RemovesOldTranslations()
    {
        // Arrange
        var product = BuildProduct(locale: "es", name: "Original", slug: "original");
        _context.Products.Add(product);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var originalTranslationId = product.Translations.First().Id;

        var newTranslations = new List<ProductTranslation>
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
        await _repository.ReplaceTranslationsAsync(product.Id, newTranslations);

        // Assert
        var oldTranslation = await _context.ProductTranslations.FindAsync(new object[] { originalTranslationId }, TestContext.Current.CancellationToken);
        oldTranslation.Should().BeNull();

        var translations = await _context.ProductTranslations
            .Where(t => t.ProductId == product.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(1);
        translations[0].Locale.Should().Be("en");
    }

    #endregion
}
