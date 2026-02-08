using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class ProductRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly ProductRepository _repository;

    public ProductRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new ProductRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<Product> SeedProduct(
        string sku = "SKU-001",
        decimal basePrice = 299.99m,
        bool isActive = true,
        bool isCustomizable = true,
        string locale = "es",
        string name = "Volante F1",
        string slug = "volante-f1",
        string? shortDescription = "Volante de competición",
        DateTime? createdAt = null)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            BasePrice = basePrice,
            VatRate = 21.00m,
            IsActive = isActive,
            IsCustomizable = isCustomizable,
            BaseProductionDays = 7,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var translation = new ProductTranslation
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Locale = locale,
            Name = name,
            Slug = slug,
            ShortDescription = shortDescription
        };

        _context.Products.Add(product);
        _context.ProductTranslations.Add(translation);
        await _context.SaveChangesAsync();

        return product;
    }

    private async Task AddImage(Guid productId, string imageUrl, int displayOrder)
    {
        _context.ProductImages.Add(new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ImageUrl = imageUrl,
            DisplayOrder = displayOrder,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    private async Task AddSpecification(Guid productId, string locale, string key, string value, int displayOrder)
    {
        _context.ProductSpecifications.Add(new ProductSpecification
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Locale = locale,
            SpecKey = key,
            SpecValue = value,
            DisplayOrder = displayOrder
        });
        await _context.SaveChangesAsync();
    }

    #endregion

    #region GetProductsAsync Tests

    [Fact]
    public async Task GetProducts_ReturnsAllActiveProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1");
        await SeedProduct(sku: "SKU-002", name: "Pedales Pro", slug: "pedales-pro");

        var filter = new ProductFilterDto { Locale = "es" };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetProducts_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        for (int i = 0; i < 5; i++)
        {
            await SeedProduct(sku: $"SKU-{i:000}", name: $"Product {i}", slug: $"product-{i}");
        }

        var filter = new ProductFilterDto { Locale = "es", Page = 2, PageSize = 2 };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public async Task GetProducts_FilterByIsActive_ReturnsOnlyActiveProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Active", slug: "active", isActive: true);
        await SeedProduct(sku: "SKU-002", name: "Inactive", slug: "inactive", isActive: false);

        var filter = new ProductFilterDto { Locale = "es", IsActive = true };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Active");
    }

    [Fact]
    public async Task GetProducts_FilterByIsCustomizable_ReturnsOnlyCustomizableProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Custom", slug: "custom", isCustomizable: true);
        await SeedProduct(sku: "SKU-002", name: "Standard", slug: "standard", isCustomizable: false);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, IsCustomizable = true };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Custom");
    }

    [Fact]
    public async Task GetProducts_FilterByMinPrice_ReturnsProductsAboveMinPrice()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Cheap", slug: "cheap", basePrice: 50m);
        await SeedProduct(sku: "SKU-002", name: "Expensive", slug: "expensive", basePrice: 500m);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, MinPrice = 100m };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Expensive");
    }

    [Fact]
    public async Task GetProducts_FilterByMaxPrice_ReturnsProductsBelowMaxPrice()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Cheap", slug: "cheap", basePrice: 50m);
        await SeedProduct(sku: "SKU-002", name: "Expensive", slug: "expensive", basePrice: 500m);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, MaxPrice = 100m };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Cheap");
    }

    [Fact]
    public async Task GetProducts_SortByPrice_ReturnsSortedProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Expensive", slug: "expensive", basePrice: 500m);
        await SeedProduct(sku: "SKU-002", name: "Cheap", slug: "cheap", basePrice: 50m);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, SortBy = "price" };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Cheap");
        result.Items[1].Name.Should().Be("Expensive");
    }

    [Fact]
    public async Task GetProducts_SortByPriceDescending_ReturnsSortedProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Cheap", slug: "cheap", basePrice: 50m);
        await SeedProduct(sku: "SKU-002", name: "Expensive", slug: "expensive", basePrice: 500m);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, SortBy = "price", SortDescending = true };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Expensive");
        result.Items[1].Name.Should().Be("Cheap");
    }

    [Fact]
    public async Task GetProducts_SortByName_ReturnsSortedProducts()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Zeta", slug: "zeta");
        await SeedProduct(sku: "SKU-002", name: "Alpha", slug: "alpha");

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, SortBy = "name" };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items[0].Name.Should().Be("Alpha");
        result.Items[1].Name.Should().Be("Zeta");
    }

    [Fact]
    public async Task GetProducts_FilterByLocale_ReturnsOnlyMatchingLocale()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1", locale: "es");

        // Add English translation for same product
        _context.ProductTranslations.Add(new ProductTranslation
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Locale = "en",
            Name = "F1 Wheel",
            Slug = "f1-wheel"
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var filterEs = new ProductFilterDto { Locale = "es", IsActive = null };
        var filterEn = new ProductFilterDto { Locale = "en", IsActive = null };

        // Act
        var resultEs = await _repository.GetProductsAsync(filterEs);
        var resultEn = await _repository.GetProductsAsync(filterEn);

        // Assert
        resultEs.Items.Should().HaveCount(1);
        resultEs.Items[0].Name.Should().Be("Volante F1");

        resultEn.Items.Should().HaveCount(1);
        resultEn.Items[0].Name.Should().Be("F1 Wheel");
    }

    [Fact]
    public async Task GetProducts_ExcludesProductsWithoutTranslation()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Spanish Only", slug: "spanish-only", locale: "es");

        var filter = new ProductFilterDto { Locale = "en", IsActive = null };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetProducts_IncludesFirstImageUrl()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "With Images", slug: "with-images");
        await AddImage(product.Id, "img2.jpg", 2);
        await AddImage(product.Id, "img1.jpg", 1);

        var filter = new ProductFilterDto { Locale = "es", IsActive = null };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Items[0].ImageUrl.Should().Be("img1.jpg");
    }

    [Fact]
    public async Task GetProducts_ClampsPageSizeTo50()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Product", slug: "product");

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, PageSize = 100 };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.PageSize.Should().Be(50);
    }

    [Fact]
    public async Task GetProducts_ClampsPageToMinimum1()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Product", slug: "product");

        var filter = new ProductFilterDto { Locale = "es", IsActive = null, Page = 0 };

        // Act
        var result = await _repository.GetProductsAsync(filter);

        // Assert
        result.Page.Should().Be(1);
    }

    #endregion

    #region GetProductByIdAsync Tests

    [Fact]
    public async Task GetProductById_WithExistingProduct_ReturnsProductDetail()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1");
        await AddImage(product.Id, "img1.jpg", 1);
        await AddSpecification(product.Id, "es", "Material", "Fibra de carbono", 1);

        // Act
        var result = await _repository.GetProductByIdAsync(product.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(product.Id);
        result.Name.Should().Be("Volante F1");
        result.Slug.Should().Be("volante-f1");
        result.Images.Should().HaveCount(1);
        result.Specifications.Should().HaveCount(1);
        result.Specifications[0].SpecKey.Should().Be("Material");
    }

    [Fact]
    public async Task GetProductById_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetProductByIdAsync(Guid.NewGuid(), "es");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetProductById_WithWrongLocale_ReturnsNull()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1", locale: "es");

        // Act
        var result = await _repository.GetProductByIdAsync(
            (await _context.Products.FirstAsync(TestContext.Current.CancellationToken)).Id, "en");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetProductById_SpecificationsFilteredByLocale()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "Volante", slug: "volante", locale: "es");
        await AddSpecification(product.Id, "es", "Material", "Fibra de carbono", 1);
        await AddSpecification(product.Id, "en", "Material", "Carbon fiber", 1);

        // Act
        var result = await _repository.GetProductByIdAsync(product.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Specifications.Should().HaveCount(1);
        result.Specifications[0].SpecValue.Should().Be("Fibra de carbono");
    }

    [Fact]
    public async Task GetProductById_ImagesOrderedByDisplayOrder()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "Volante", slug: "volante");
        await AddImage(product.Id, "third.jpg", 3);
        await AddImage(product.Id, "first.jpg", 1);
        await AddImage(product.Id, "second.jpg", 2);

        // Act
        var result = await _repository.GetProductByIdAsync(product.Id, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Images.Should().HaveCount(3);
        result.Images[0].ImageUrl.Should().Be("first.jpg");
        result.Images[1].ImageUrl.Should().Be("second.jpg");
        result.Images[2].ImageUrl.Should().Be("third.jpg");
    }

    #endregion

    #region GetProductBySlugAsync Tests

    [Fact]
    public async Task GetProductBySlug_WithExistingSlug_ReturnsProductDetail()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1");

        // Act
        var result = await _repository.GetProductBySlugAsync("volante-f1", "es");

        // Assert
        result.Should().NotBeNull();
        result!.Slug.Should().Be("volante-f1");
        result.Name.Should().Be("Volante F1");
    }

    [Fact]
    public async Task GetProductBySlug_WithNonExistentSlug_ReturnsNull()
    {
        // Act
        var result = await _repository.GetProductBySlugAsync("non-existent", "es");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetProductBySlug_WithWrongLocale_ReturnsNull()
    {
        // Arrange
        await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1", locale: "es");

        // Act
        var result = await _repository.GetProductBySlugAsync("volante-f1", "en");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetProductBySlug_IncludesImagesAndSpecifications()
    {
        // Arrange
        var product = await SeedProduct(sku: "SKU-001", name: "Volante F1", slug: "volante-f1");
        await AddImage(product.Id, "img1.jpg", 1);
        await AddImage(product.Id, "img2.jpg", 2);
        await AddSpecification(product.Id, "es", "Peso", "350g", 1);

        // Act
        var result = await _repository.GetProductBySlugAsync("volante-f1", "es");

        // Assert
        result.Should().NotBeNull();
        result!.Images.Should().HaveCount(2);
        result.Specifications.Should().HaveCount(1);
    }

    #endregion
}
