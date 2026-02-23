using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.UnitTests.Controllers;

public class ComponentsControllerTests
{
    private readonly Mock<IComponentRepository> _repositoryMock;
    private readonly Mock<ILogger<ComponentsController>> _loggerMock;
    private readonly ComponentsController _controller;

    public ComponentsControllerTests()
    {
        _repositoryMock = new Mock<IComponentRepository>();
        _loggerMock = new Mock<ILogger<ComponentsController>>();
        _controller = new ComponentsController(_repositoryMock.Object, _loggerMock.Object);
    }

    #region GetComponents Tests

    [Fact]
    public async Task GetComponents_ReturnsOkWithPaginatedResult()
    {
        // Arrange
        var filter = new ComponentFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<ComponentListItemDto>
        {
            Items = new List<ComponentListItemDto>
            {
                new() { Id = Guid.NewGuid(), Sku = "COMP-001", ComponentType = "grip", Name = "Grip Rojo", InStock = true }
            },
            TotalCount = 1,
            Page = 1,
            PageSize = 12,
            TotalPages = 1
        };

        _repositoryMock.Setup(x => x.GetComponentsAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetComponents(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<ComponentListItemDto>>().Subject;
        response.Items.Should().HaveCount(1);
        response.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task GetComponents_WithEmptyResult_ReturnsOkWithEmptyList()
    {
        // Arrange
        var filter = new ComponentFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<ComponentListItemDto>
        {
            Items = new List<ComponentListItemDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 12,
            TotalPages = 0
        };

        _repositoryMock.Setup(x => x.GetComponentsAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetComponents(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<ComponentListItemDto>>().Subject;
        response.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetComponents_PassesFilterToRepository()
    {
        // Arrange
        var filter = new ComponentFilterDto
        {
            Search = "grip",
            ComponentType = "grip",
            InStock = true,
            Locale = "en",
            Page = 2,
            PageSize = 6
        };

        _repositoryMock.Setup(x => x.GetComponentsAsync(filter))
            .ReturnsAsync(new PaginatedResultDto<ComponentListItemDto>());

        // Act
        await _controller.GetComponents(filter);

        // Assert
        _repositoryMock.Verify(x => x.GetComponentsAsync(filter), Times.Once);
    }

    #endregion

    #region GetComponentsByProductId Tests

    [Fact]
    public async Task GetComponentsByProductId_WithExistingComponents_ReturnsOk()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var expectedResult = new List<ProductComponentOptionDto>
        {
            new()
            {
                ComponentId = Guid.NewGuid(),
                Sku = "COMP-001",
                ComponentType = "grip",
                Name = "Grip Rojo",
                OptionGroup = "grip_color",
                PriceModifier = 0m,
                IsDefault = true,
                DisplayOrder = 0,
                StockQuantity = 10,
                InStock = true
            }
        };

        _repositoryMock.Setup(x => x.GetComponentsByProductIdAsync(productId, "es"))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetComponentsByProductId(productId, "es");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeAssignableTo<List<ProductComponentOptionDto>>().Subject;
        response.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetComponentsByProductId_WithNoComponents_ReturnsOkWithEmptyList()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetComponentsByProductIdAsync(productId, "es"))
            .ReturnsAsync(new List<ProductComponentOptionDto>());

        // Act
        var result = await _controller.GetComponentsByProductId(productId, "es");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeAssignableTo<List<ProductComponentOptionDto>>().Subject;
        response.Should().BeEmpty();
    }

    [Fact]
    public async Task GetComponentsByProductId_DefaultsLocaleToEs()
    {
        // Arrange
        var productId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetComponentsByProductIdAsync(productId, "es"))
            .ReturnsAsync(new List<ProductComponentOptionDto>());

        // Act
        await _controller.GetComponentsByProductId(productId);

        // Assert
        _repositoryMock.Verify(x => x.GetComponentsByProductIdAsync(productId, "es"), Times.Once);
    }

    #endregion
}
