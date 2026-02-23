using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class CachedProductRepositoryTests
{
    private readonly Mock<IProductRepository> _innerRepoMock;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<ILogger<CachedProductRepository>> _loggerMock;
    private readonly CachedProductRepository _cachedRepo;

    public CachedProductRepositoryTests()
    {
        _innerRepoMock = new Mock<IProductRepository>();
        _cacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<CachedProductRepository>>();
        _cachedRepo = new CachedProductRepository(_innerRepoMock.Object, _cacheMock.Object, _loggerMock.Object);
    }

    #region GetProductsAsync Tests

    [Fact]
    public async Task GetProductsAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var filter = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var cachedResult = new PaginatedResultDto<ProductListItemDto>
        {
            Items = new List<ProductListItemDto>
            {
                new() { Id = Guid.NewGuid(), Sku = "SKU-001", Name = "Volante F1", Slug = "volante-f1", BasePrice = 299.99m }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 12,
            TotalPages = 1
        };
        var cacheKey = CachedProductRepository.BuildListCacheKey(filter);
        var serialized = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cachedResult));

        _cacheMock.Setup(c => c.GetAsync(cacheKey, default))
            .ReturnsAsync(serialized);

        // Act
        var result = await _cachedRepo.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Sku.Should().Be("SKU-001");
        _innerRepoMock.Verify(r => r.GetProductsAsync(It.IsAny<ProductFilterDto>()), Times.Never);
    }

    [Fact]
    public async Task GetProductsAsync_CacheMiss_QueriesRepositoryAndCaches()
    {
        // Arrange
        var filter = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var dbResult = new PaginatedResultDto<ProductListItemDto>
        {
            Items = new List<ProductListItemDto>
            {
                new() { Id = Guid.NewGuid(), Sku = "SKU-002", Name = "Pedales Pro", Slug = "pedales-pro", BasePrice = 499.99m }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 12,
            TotalPages = 1
        };

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetProductsAsync(filter))
            .ReturnsAsync(dbResult);

        _cacheMock.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cachedRepo.GetProductsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Sku.Should().Be("SKU-002");
        _innerRepoMock.Verify(r => r.GetProductsAsync(filter), Times.Once);
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == TimeSpan.FromHours(1)),
            default), Times.Once);
    }

    #endregion

    #region GetProductByIdAsync Tests

    [Fact]
    public async Task GetProductByIdAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var cachedProduct = new ProductDetailDto
        {
            Id = productId,
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true
        };
        var cacheKey = $"products:detail:id:{productId}:es";
        var serialized = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cachedProduct));

        _cacheMock.Setup(c => c.GetAsync(cacheKey, default))
            .ReturnsAsync(serialized);

        // Act
        var result = await _cachedRepo.GetProductByIdAsync(productId, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(productId);
        _innerRepoMock.Verify(r => r.GetProductByIdAsync(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetProductByIdAsync_CacheMiss_QueriesRepositoryAndCaches()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var dbProduct = new ProductDetailDto
        {
            Id = productId,
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true
        };

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync(dbProduct);

        _cacheMock.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cachedRepo.GetProductByIdAsync(productId, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(productId);
        _innerRepoMock.Verify(r => r.GetProductByIdAsync(productId, "es"), Times.Once);
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == TimeSpan.FromHours(24)),
            default), Times.Once);
    }

    [Fact]
    public async Task GetProductByIdAsync_CacheMiss_NullResult_DoesNotCache()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        var result = await _cachedRepo.GetProductByIdAsync(productId, "es");

        // Assert
        result.Should().BeNull();
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(), It.IsAny<byte[]>(),
            It.IsAny<DistributedCacheEntryOptions>(), default), Times.Never);
    }

    #endregion

    #region GetProductBySlugAsync Tests

    [Fact]
    public async Task GetProductBySlugAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var cachedProduct = new ProductDetailDto
        {
            Id = Guid.NewGuid(),
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true
        };
        var cacheKey = "products:detail:slug:volante-f1:es";
        var serialized = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cachedProduct));

        _cacheMock.Setup(c => c.GetAsync(cacheKey, default))
            .ReturnsAsync(serialized);

        // Act
        var result = await _cachedRepo.GetProductBySlugAsync("volante-f1", "es");

        // Assert
        result.Should().NotBeNull();
        result!.Slug.Should().Be("volante-f1");
        _innerRepoMock.Verify(r => r.GetProductBySlugAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetProductBySlugAsync_CacheMiss_QueriesRepositoryAndCaches()
    {
        // Arrange
        var dbProduct = new ProductDetailDto
        {
            Id = Guid.NewGuid(),
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true
        };

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetProductBySlugAsync("volante-f1", "es"))
            .ReturnsAsync(dbProduct);

        _cacheMock.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cachedRepo.GetProductBySlugAsync("volante-f1", "es");

        // Assert
        result.Should().NotBeNull();
        result!.Slug.Should().Be("volante-f1");
        _innerRepoMock.Verify(r => r.GetProductBySlugAsync("volante-f1", "es"), Times.Once);
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == TimeSpan.FromHours(24)),
            default), Times.Once);
    }

    [Fact]
    public async Task GetProductBySlugAsync_CacheMiss_NullResult_DoesNotCache()
    {
        // Arrange
        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetProductBySlugAsync("missing", "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        var result = await _cachedRepo.GetProductBySlugAsync("missing", "es");

        // Assert
        result.Should().BeNull();
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(), It.IsAny<byte[]>(),
            It.IsAny<DistributedCacheEntryOptions>(), default), Times.Never);
    }

    #endregion

    #region Cache Key Tests

    [Fact]
    public void BuildListCacheKey_IncludesAllFilterParameters()
    {
        var filter = new ProductFilterDto
        {
            Locale = "en",
            Page = 2,
            PageSize = 6,
            Search = "volante",
            CategorySlug = "volantes",
            MinPrice = 100,
            MaxPrice = 500,
            IsActive = true,
            IsCustomizable = false,
            SortBy = "price",
            SortDescending = true
        };

        var key = CachedProductRepository.BuildListCacheKey(filter);

        key.Should().Contain("en");
        key.Should().Contain("2");
        key.Should().Contain("6");
        key.Should().Contain("volante");
        key.Should().Contain("volantes");
        key.Should().Contain("100");
        key.Should().Contain("500");
        key.Should().Contain("True");
        key.Should().Contain("False");
        key.Should().Contain("price");
    }

    [Fact]
    public void BuildListCacheKey_DifferentFilters_ProduceDifferentKeys()
    {
        var filter1 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var filter2 = new ProductFilterDto { Page = 2, PageSize = 12, Locale = "es" };

        var key1 = CachedProductRepository.BuildListCacheKey(filter1);
        var key2 = CachedProductRepository.BuildListCacheKey(filter2);

        key1.Should().NotBe(key2);
    }

    [Fact]
    public void BuildListCacheKey_DifferentCategorySlug_ProducesDifferentKeys()
    {
        var filter1 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es", CategorySlug = "volantes" };
        var filter2 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es", CategorySlug = "pedales" };
        var filter3 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };

        var key1 = CachedProductRepository.BuildListCacheKey(filter1);
        var key2 = CachedProductRepository.BuildListCacheKey(filter2);
        var key3 = CachedProductRepository.BuildListCacheKey(filter3);

        key1.Should().NotBe(key2);
        key1.Should().NotBe(key3);
        key2.Should().NotBe(key3);
    }

    [Fact]
    public void BuildListCacheKey_SameFilters_ProduceSameKey()
    {
        var filter1 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es", Search = "volante" };
        var filter2 = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es", Search = "volante" };

        var key1 = CachedProductRepository.BuildListCacheKey(filter1);
        var key2 = CachedProductRepository.BuildListCacheKey(filter2);

        key1.Should().Be(key2);
    }

    #endregion
}
