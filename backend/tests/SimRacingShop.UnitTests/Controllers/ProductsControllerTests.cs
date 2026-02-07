using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.UnitTests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly Mock<ILogger<ProductsController>> _loggerMock;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _loggerMock = new Mock<ILogger<ProductsController>>();
        _controller = new ProductsController(_repositoryMock.Object, _loggerMock.Object);
    }

    #region GetProducts Tests

    [Fact]
    public async Task GetProducts_ReturnsOkWithPaginatedResult()
    {
        // Arrange
        var filter = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<ProductListItemDto>
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

        _repositoryMock.Setup(x => x.GetProductsAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetProducts(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<ProductListItemDto>>().Subject;
        response.Items.Should().HaveCount(1);
        response.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task GetProducts_WithEmptyResult_ReturnsOkWithEmptyList()
    {
        // Arrange
        var filter = new ProductFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<ProductListItemDto>
        {
            Items = new List<ProductListItemDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 12,
            TotalPages = 0
        };

        _repositoryMock.Setup(x => x.GetProductsAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetProducts(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<ProductListItemDto>>().Subject;
        response.Items.Should().BeEmpty();
        response.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetProducts_PassesFilterToRepository()
    {
        // Arrange
        var filter = new ProductFilterDto
        {
            Search = "volante",
            MinPrice = 100,
            MaxPrice = 500,
            Locale = "en",
            Page = 2,
            PageSize = 6,
            SortBy = "price",
            SortDescending = true
        };

        _repositoryMock.Setup(x => x.GetProductsAsync(filter))
            .ReturnsAsync(new PaginatedResultDto<ProductListItemDto>());

        // Act
        await _controller.GetProducts(filter);

        // Assert
        _repositoryMock.Verify(x => x.GetProductsAsync(filter), Times.Once);
    }

    #endregion

    #region GetProductById Tests

    [Fact]
    public async Task GetProductById_WithExistingProduct_ReturnsOk()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var expectedProduct = new ProductDetailDto
        {
            Id = productId,
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true,
            Images = new List<ProductImageDto>(),
            Specifications = new List<ProductSpecificationDto>()
        };

        _repositoryMock.Setup(x => x.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync(expectedProduct);

        // Act
        var result = await _controller.GetProductById(productId, "es");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var product = okResult.Value.Should().BeOfType<ProductDetailDto>().Subject;
        product.Id.Should().Be(productId);
        product.Name.Should().Be("Volante F1");
    }

    [Fact]
    public async Task GetProductById_WithNonExistentProduct_ReturnsNotFound()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        var result = await _controller.GetProductById(productId, "es");

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetProductById_DefaultsLocaleToEs()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        await _controller.GetProductById(productId);

        // Assert
        _repositoryMock.Verify(x => x.GetProductByIdAsync(productId, "es"), Times.Once);
    }

    [Fact]
    public async Task GetProductById_NotFound_LogsWarning()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetProductByIdAsync(productId, "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        await _controller.GetProductById(productId, "es");

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Product not found")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region GetProductBySlug Tests

    [Fact]
    public async Task GetProductBySlug_WithExistingProduct_ReturnsOk()
    {
        // Arrange
        var expectedProduct = new ProductDetailDto
        {
            Id = Guid.NewGuid(),
            Sku = "SKU-001",
            Name = "Volante F1",
            Slug = "volante-f1",
            BasePrice = 299.99m,
            VatRate = 0.21m,
            IsActive = true,
            Images = new List<ProductImageDto>(),
            Specifications = new List<ProductSpecificationDto>()
        };

        _repositoryMock.Setup(x => x.GetProductBySlugAsync("volante-f1", "es"))
            .ReturnsAsync(expectedProduct);

        // Act
        var result = await _controller.GetProductBySlug("volante-f1", "es");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var product = okResult.Value.Should().BeOfType<ProductDetailDto>().Subject;
        product.Slug.Should().Be("volante-f1");
    }

    [Fact]
    public async Task GetProductBySlug_WithNonExistentSlug_ReturnsNotFound()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetProductBySlugAsync("non-existent", "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        var result = await _controller.GetProductBySlug("non-existent", "es");

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetProductBySlug_DefaultsLocaleToEs()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetProductBySlugAsync("volante-f1", "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        await _controller.GetProductBySlug("volante-f1");

        // Assert
        _repositoryMock.Verify(x => x.GetProductBySlugAsync("volante-f1", "es"), Times.Once);
    }

    [Fact]
    public async Task GetProductBySlug_NotFound_LogsWarning()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetProductBySlugAsync("missing", "es"))
            .ReturnsAsync((ProductDetailDto?)null);

        // Act
        await _controller.GetProductBySlug("missing", "es");

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Product not found by slug")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
