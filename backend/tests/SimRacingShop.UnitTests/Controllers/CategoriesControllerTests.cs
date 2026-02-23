using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.UnitTests.Controllers;

public class CategoriesControllerTests
{
    private readonly Mock<ICategoryRepository> _repositoryMock;
    private readonly Mock<ILogger<CategoriesController>> _loggerMock;
    private readonly CategoriesController _controller;

    public CategoriesControllerTests()
    {
        _repositoryMock = new Mock<ICategoryRepository>();
        _loggerMock = new Mock<ILogger<CategoriesController>>();
        _controller = new CategoriesController(_repositoryMock.Object, _loggerMock.Object);
    }

    #region GetCategories Tests

    [Fact]
    public async Task GetCategories_ReturnsOkWithPaginatedResult()
    {
        // Arrange
        var filter = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<CategoryListItemDto>
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

        _repositoryMock.Setup(x => x.GetCategoriesAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetCategories(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<CategoryListItemDto>>().Subject;
        response.Items.Should().HaveCount(1);
        response.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task GetCategories_WithEmptyResult_ReturnsOkWithEmptyList()
    {
        // Arrange
        var filter = new CategoryFilterDto { Page = 1, PageSize = 12, Locale = "es" };
        var expectedResult = new PaginatedResultDto<CategoryListItemDto>
        {
            Items = new List<CategoryListItemDto>(),
            TotalCount = 0,
            Page = 1,
            PageSize = 12,
            TotalPages = 0
        };

        _repositoryMock.Setup(x => x.GetCategoriesAsync(filter))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.GetCategories(filter);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PaginatedResultDto<CategoryListItemDto>>().Subject;
        response.Items.Should().BeEmpty();
        response.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetCategories_PassesFilterToRepository()
    {
        // Arrange
        var filter = new CategoryFilterDto
        {
            Locale = "en",
            Page = 2,
            PageSize = 6,
            IsActive = true,
            SortBy = "name",
            SortDescending = true
        };

        _repositoryMock.Setup(x => x.GetCategoriesAsync(filter))
            .ReturnsAsync(new PaginatedResultDto<CategoryListItemDto>());

        // Act
        await _controller.GetCategories(filter);

        // Assert
        _repositoryMock.Verify(x => x.GetCategoriesAsync(filter), Times.Once);
    }

    #endregion

    #region GetCategoryById Tests

    [Fact]
    public async Task GetCategoryById_WithExistingCategory_ReturnsOk()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var expectedCategory = new CategoryDetailDto
        {
            Id = categoryId,
            Name = "Volantes",
            Slug = "volantes",
            IsActive = true,
            Image = new CategoryImageDto()
        };

        _repositoryMock.Setup(x => x.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync(expectedCategory);

        // Act
        var result = await _controller.GetCategoryById(categoryId, "es");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var category = okResult.Value.Should().BeOfType<CategoryDetailDto>().Subject;
        category.Id.Should().Be(categoryId);
        category.Name.Should().Be("Volantes");
    }

    [Fact]
    public async Task GetCategoryById_WithNonExistentCategory_ReturnsNotFound()
    {
        // Arrange
        var categoryId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync((CategoryDetailDto?)null);

        // Act
        var result = await _controller.GetCategoryById(categoryId, "es");

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task GetCategoryById_DefaultsLocaleToEs()
    {
        // Arrange
        var categoryId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync((CategoryDetailDto?)null);

        // Act
        await _controller.GetCategoryById(categoryId);

        // Assert
        _repositoryMock.Verify(x => x.GetCategoryByIdAsync(categoryId, "es"), Times.Once);
    }

    [Fact]
    public async Task GetCategoryById_NotFound_LogsWarning()
    {
        // Arrange
        var categoryId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetCategoryByIdAsync(categoryId, "es"))
            .ReturnsAsync((CategoryDetailDto?)null);

        // Act
        await _controller.GetCategoryById(categoryId, "es");

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Category not found")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
