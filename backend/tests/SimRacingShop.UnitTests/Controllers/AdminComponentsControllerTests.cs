using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class AdminComponentsControllerTests
{
    private readonly Mock<IComponentAdminRepository> _adminRepoMock;
    private readonly Mock<ILogger<AdminComponentsController>> _loggerMock;
    private readonly AdminComponentsController _controller;

    public AdminComponentsControllerTests()
    {
        _adminRepoMock = new Mock<IComponentAdminRepository>();
        _loggerMock = new Mock<ILogger<AdminComponentsController>>();

        _controller = new AdminComponentsController(
            _adminRepoMock.Object,
            _loggerMock.Object);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    #region Helper Methods

    private static Component BuildComponent(
        string sku = "COMP-001",
        string componentType = "grip",
        int stockQuantity = 10,
        int minStockThreshold = 5,
        string locale = "es",
        string name = "Grip Estándar")
    {
        var componentId = Guid.NewGuid();
        return new Component
        {
            Id = componentId,
            Sku = sku,
            ComponentType = componentType,
            StockQuantity = stockQuantity,
            MinStockThreshold = minStockThreshold,
            LeadTimeDays = 3,
            CostPrice = 15.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Translations = new List<ComponentTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ComponentId = componentId,
                    Locale = locale,
                    Name = name,
                    Description = "Grip de cuero sintético"
                }
            },
            ProductComponentOptions = new List<ProductComponentOption>()
        };
    }

    #endregion

    #region CreateComponent Tests

    [Fact]
    public async Task CreateComponent_WithValidData_Returns201()
    {
        // Arrange
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            StockQuantity = 10,
            MinStockThreshold = 5,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Grip Estándar", Description = "Grip de cuero" }
            }
        };

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Component>()))
            .ReturnsAsync((Component c) => c);

        // Act
        var result = await _controller.CreateComponent(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var detail = createdResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.Sku.Should().Be("COMP-001");
        detail.ComponentType.Should().Be("grip");
    }

    [Fact]
    public async Task CreateComponent_CallsRepositoryCreate()
    {
        // Arrange
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "button_plate",
            StockQuantity = 20,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Botonera 12" }
            }
        };

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Component>()))
            .ReturnsAsync((Component c) => c);

        // Act
        await _controller.CreateComponent(dto);

        // Assert
        _adminRepoMock.Verify(r => r.CreateAsync(It.Is<Component>(c =>
            c.Sku == "COMP-001" &&
            c.ComponentType == "button_plate" &&
            c.StockQuantity == 20 &&
            c.Translations.Count == 1)), Times.Once);
    }

    #endregion

    #region UpdateComponent Tests

    [Fact]
    public async Task UpdateComponent_WithExistingComponent_Returns200()
    {
        // Arrange
        var component = BuildComponent();
        var dto = new UpdateComponentDto
        {
            ComponentType = "grip",
            StockQuantity = 25,
            MinStockThreshold = 10,
            LeadTimeDays = 5,
            CostPrice = 20.00m
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Component>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateComponent(component.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.StockQuantity.Should().Be(25);
        detail.MinStockThreshold.Should().Be(10);
        detail.CostPrice.Should().Be(20.00m);
    }

    [Fact]
    public async Task UpdateComponent_WithNonExistentComponent_Returns404()
    {
        // Arrange
        var dto = new UpdateComponentDto { ComponentType = "grip" };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Component?)null);

        // Act
        var result = await _controller.UpdateComponent(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    #endregion

    #region DeleteComponent Tests

    [Fact]
    public async Task DeleteComponent_WithExistingComponent_Returns204()
    {
        // Arrange
        var component = BuildComponent();

        _adminRepoMock.Setup(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component);

        _adminRepoMock.Setup(r => r.DeleteAsync(component))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteComponent(component.Id);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteComponent_WithNonExistentComponent_Returns404()
    {
        // Arrange
        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Component?)null);

        // Act
        var result = await _controller.DeleteComponent(Guid.NewGuid());

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    #endregion

    #region UpdateStock Tests

    [Fact]
    public async Task UpdateStock_WithExistingComponent_Returns200()
    {
        // Arrange
        var component = BuildComponent(stockQuantity: 10);
        var dto = new UpdateStockDto { Quantity = 50 };

        _adminRepoMock.Setup(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Component>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateStock(component.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.StockQuantity.Should().Be(50);
        detail.InStock.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateStock_WithNonExistentComponent_Returns404()
    {
        // Arrange
        var dto = new UpdateStockDto { Quantity = 10 };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Component?)null);

        // Act
        var result = await _controller.UpdateStock(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateStock_ToZero_ShowsOutOfStock()
    {
        // Arrange
        var component = BuildComponent(stockQuantity: 10);
        var dto = new UpdateStockDto { Quantity = 0 };

        _adminRepoMock.Setup(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Component>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateStock(component.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.StockQuantity.Should().Be(0);
        detail.InStock.Should().BeFalse();
        detail.LowStock.Should().BeTrue();
    }

    #endregion

    #region UpdateTranslations Tests

    [Fact]
    public async Task UpdateTranslations_WithExistingComponent_Returns200()
    {
        // Arrange
        var component = BuildComponent();
        var dto = new UpdateComponentTranslationsDto
        {
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Grip Nuevo", Description = "Descripción nueva" },
                new() { Locale = "en", Name = "New Grip" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component);

        _adminRepoMock.Setup(r => r.ReplaceTranslationsAsync(component.Id, It.IsAny<List<ComponentTranslation>>()))
            .Returns(Task.CompletedTask);

        var updatedComponent = BuildComponent();
        updatedComponent.Id = component.Id;
        updatedComponent.Translations = new List<ComponentTranslation>
        {
            new() { Id = Guid.NewGuid(), ComponentId = component.Id, Locale = "es", Name = "Grip Nuevo", Description = "Descripción nueva" },
            new() { Id = Guid.NewGuid(), ComponentId = component.Id, Locale = "en", Name = "New Grip" }
        };

        _adminRepoMock.SetupSequence(r => r.GetByIdAsync(component.Id))
            .ReturnsAsync(component)
            .ReturnsAsync(updatedComponent);

        // Act
        var result = await _controller.UpdateTranslations(component.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.Translations.Should().HaveCount(2);
    }

    [Fact]
    public async Task UpdateTranslations_WithNonExistentComponent_Returns404()
    {
        // Arrange
        var dto = new UpdateComponentTranslationsDto
        {
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Component?)null);

        // Act
        var result = await _controller.UpdateTranslations(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    #endregion

    #region GetLowStock Tests

    [Fact]
    public async Task GetLowStock_ReturnsLowStockComponents()
    {
        // Arrange
        var components = new List<Component>
        {
            BuildComponent(sku: "COMP-001", name: "Grip Bajo Stock", stockQuantity: 2, minStockThreshold: 5),
            BuildComponent(sku: "COMP-002", name: "Botonera Sin Stock", stockQuantity: 0, minStockThreshold: 5)
        };

        _adminRepoMock.Setup(r => r.GetLowStockAsync())
            .ReturnsAsync(components);

        // Act
        var result = await _controller.GetLowStock();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var items = okResult.Value.Should().BeAssignableTo<List<ComponentDetailDto>>().Subject;
        items.Should().HaveCount(2);
        items.Should().AllSatisfy(i => i.LowStock.Should().BeTrue());
    }

    [Fact]
    public async Task GetLowStock_WithNoLowStockComponents_ReturnsEmptyList()
    {
        // Arrange
        _adminRepoMock.Setup(r => r.GetLowStockAsync())
            .ReturnsAsync(new List<Component>());

        // Act
        var result = await _controller.GetLowStock();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var items = okResult.Value.Should().BeAssignableTo<List<ComponentDetailDto>>().Subject;
        items.Should().BeEmpty();
    }

    #endregion

    #region MapToDetailDto Tests

    [Fact]
    public async Task CreateComponent_SetsLowStockCorrectly()
    {
        // Arrange - stock below threshold
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            StockQuantity = 3,
            MinStockThreshold = 5,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Grip" }
            }
        };

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Component>()))
            .ReturnsAsync((Component c) => c);

        // Act
        var result = await _controller.CreateComponent(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var detail = createdResult.Value.Should().BeOfType<ComponentDetailDto>().Subject;
        detail.LowStock.Should().BeTrue();
        detail.InStock.Should().BeTrue();
    }

    #endregion
}
