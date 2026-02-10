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

public class CachedCategoryRepositoryTests
{
    private readonly Mock<ICategoryRepository> _innerRepoMock;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<ILogger<CachedCategoryRepository>> _loggerMock;
    private readonly CachedCategoryRepository _cachedRepo;

    public CachedCategoryRepositoryTests()
    {
        _innerRepoMock = new Mock<ICategoryRepository>();
        _cacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<CachedCategoryRepository>>();
        _cachedRepo = new CachedCategoryRepository(_innerRepoMock.Object, _cacheMock.Object, _loggerMock.Object);
    }

    #region GetCategoriesAsync Tests

    [Fact]
    public async Task GetCategoriesAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var filter = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var cachedResult = new PaginatedResultDto<CategoryListItemDto>
        {
            Items = new List<CategoryListItemDto>
            {
                new() { Id = Guid.NewGuid(), Name = "Volantes", Slug = "volantes", IsActive = true }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 12,
            TotalPages = 1
        };
        var cacheKey = CachedCategoryRepository.BuildListCacheKey(filter);
        var serialized = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cachedResult));

        _cacheMock.Setup(c => c.GetAsync(cacheKey, default))
            .ReturnsAsync(serialized);

        // Act
        var result = await _cachedRepo.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Volantes");
        _innerRepoMock.Verify(r => r.GetCategoriesAsync(It.IsAny<CategoryFilterDto>()), Times.Never);
    }

    [Fact]
    public async Task GetCategoriesAsync_CacheMiss_QueriesRepositoryAndCaches()
    {
        // Arrange
        var filter = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var dbResult = new PaginatedResultDto<CategoryListItemDto>
        {
            Items = new List<CategoryListItemDto>
            {
                new() { Id = Guid.NewGuid(), Name = "Pedales", Slug = "pedales", IsActive = true }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 12,
            TotalPages = 1
        };

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetCategoriesAsync(filter))
            .ReturnsAsync(dbResult);

        _cacheMock.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cachedRepo.GetCategoriesAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Pedales");
        _innerRepoMock.Verify(r => r.GetCategoriesAsync(filter), Times.Once);
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == TimeSpan.FromHours(1)),
            default), Times.Once);
    }

    #endregion

    #region GetCategoryByIdAsync Tests

    [Fact]
    public async Task GetCategoryByIdAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var cachedCategory = new CategoryDetailDto
        {
            Id = categoryId,
            Name = "Volantes",
            Slug = "volantes",
            IsActive = true
        };
        var cacheKey = $"products:detail:id:{categoryId}:es";
        var serialized = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(cachedCategory));

        _cacheMock.Setup(c => c.GetAsync(cacheKey, default))
            .ReturnsAsync(serialized);

        // Act
        var result = await _cachedRepo.GetCategoryByIdAsync(categoryId, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(categoryId);
        _innerRepoMock.Verify(r => r.GetCategoryByIdAsync(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_CacheMiss_QueriesRepositoryAndCaches()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var dbCategory = new CategoryDetailDto
        {
            Id = categoryId,
            Name = "Volantes",
            Slug = "volantes",
            IsActive = true
        };

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync(dbCategory);

        _cacheMock.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cachedRepo.GetCategoryByIdAsync(categoryId, "es");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(categoryId);
        _innerRepoMock.Verify(r => r.GetCategoryByIdAsync(categoryId, "es"), Times.Once);
        _cacheMock.Verify(c => c.SetAsync(
            It.IsAny<string>(),
            It.IsAny<byte[]>(),
            It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == TimeSpan.FromHours(24)),
            default), Times.Once);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_CacheMiss_NullResult_DoesNotCache()
    {
        // Arrange
        var categoryId = Guid.NewGuid();

        _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), default))
            .ReturnsAsync((byte[]?)null);

        _innerRepoMock.Setup(r => r.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync((CategoryDetailDto?)null);

        // Act
        var result = await _cachedRepo.GetCategoryByIdAsync(categoryId, "es");

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
        var filter = new CategoryFilterDto
        {
            Locale = "en",
            Page = 2,
            PageSize = 6,
            IsActive = true,
            SortBy = "name",
            SortDescending = true
        };

        var key = CachedCategoryRepository.BuildListCacheKey(filter);

        key.Should().Contain("en");
        key.Should().Contain("2");
        key.Should().Contain("6");
        key.Should().Contain("True");
        key.Should().Contain("name");
    }

    [Fact]
    public void BuildListCacheKey_DifferentFilters_ProduceDifferentKeys()
    {
        var filter1 = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var filter2 = new CategoryFilterDto { Page = 2, PageSize = 12, Locale = "es" };

        var key1 = CachedCategoryRepository.BuildListCacheKey(filter1);
        var key2 = CachedCategoryRepository.BuildListCacheKey(filter2);

        key1.Should().NotBe(key2);
    }

    [Fact]
    public void BuildListCacheKey_SameFilters_ProduceSameKey()
    {
        var filter1 = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es", SortBy = "name" };
        var filter2 = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es", SortBy = "name" };

        var key1 = CachedCategoryRepository.BuildListCacheKey(filter1);
        var key2 = CachedCategoryRepository.BuildListCacheKey(filter2);

        key1.Should().Be(key2);
    }

    #endregion
}
