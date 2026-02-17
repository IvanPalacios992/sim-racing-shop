using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;
using SimRacingShop.Infrastructure.Services;

namespace SimRacingShop.UnitTests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<IProductAdminRepository> _productRepositoryMock;
    private readonly Mock<IShippingService> _shippingServiceMock;
    private readonly Mock<ILogger<OrderService>> _loggerMock;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _productRepositoryMock = new Mock<IProductAdminRepository>();
        _shippingServiceMock = new Mock<IShippingService>();
        _loggerMock = new Mock<ILogger<OrderService>>();
        _service = new OrderService(
            _orderRepositoryMock.Object,
            _productRepositoryMock.Object,
            _shippingServiceMock.Object,
            _loggerMock.Object
        );
    }

    #region CreateOrderAsync Tests

    [Fact]
    public async Task CreateOrderAsync_WithValidData_CreatesOrderSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m); // Precio base sin IVA

        var dto = new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 123",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 299.99m,
            VatAmount = 63.00m, // 21% de 299.99
            ShippingCost = 6.25m,
            TotalAmount = 369.24m, // 299.99 + 63.00 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,
                    LineTotal = 299.99m
                }
            }
        };

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        _orderRepositoryMock
            .Setup(x => x.CountByOrderNumberPrefixAsync(It.IsAny<string>()))
            .ReturnsAsync(0);

        _orderRepositoryMock
            .Setup(x => x.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync((Order o) => o);

        // Act
        var result = await _service.CreateOrderAsync(dto, userId);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.OrderStatus.Should().Be("pending");
        result.OrderItems.Should().HaveCount(1);
        result.Subtotal.Should().BeApproximately(299.99m, 0.02m); // Allow rounding differences
        result.TotalAmount.Should().BeApproximately(369.24m, 0.02m);

        _orderRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Order>()), Times.Once);
    }

    [Fact]
    public async Task CreateOrderAsync_GeneratesUniqueOrderNumber()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        _orderRepositoryMock
            .Setup(x => x.CountByOrderNumberPrefixAsync(It.IsAny<string>()))
            .ReturnsAsync(5); // Ya existen 5 pedidos hoy

        _orderRepositoryMock
            .Setup(x => x.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync((Order o) => o);

        // Act
        var result = await _service.CreateOrderAsync(dto, userId);

        // Assert
        result.OrderNumber.Should().MatchRegex(@"ORD-\d{8}-\d{4}");
        result.OrderNumber.Should().EndWith("-0006"); // Debería ser el 6º pedido
    }

    [Fact]
    public async Task CreateOrderAsync_CalculatesEstimatedProductionDays()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var product1Id = Guid.NewGuid();
        var product2Id = Guid.NewGuid();

        var product1 = CreateTestProduct(product1Id, "VOL-001", 100m);
        product1.BaseProductionDays = 7;

        var product2 = CreateTestProduct(product2Id, "VOL-002", 150m);
        product2.BaseProductionDays = 14;

        var dto = new CreateOrderDto
        {
            ShippingStreet = "Test Street",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 302.50m,
            VatAmount = 63.52m,
            ShippingCost = 6.25m,
            TotalAmount = 372.27m,
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = product1Id,
                    ProductName = "Product 1",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 121m,
                    LineTotal = 121m
                },
                new CreateOrderItemDto
                {
                    ProductId = product2Id,
                    ProductName = "Product 2",
                    ProductSku = "VOL-002",
                    Quantity = 1,
                    UnitPrice = 181.50m,
                    LineTotal = 181.50m
                }
            }
        };

        _productRepositoryMock.Setup(x => x.GetByIdAsync(product1Id)).ReturnsAsync(product1);
        _productRepositoryMock.Setup(x => x.GetByIdAsync(product2Id)).ReturnsAsync(product2);
        _shippingServiceMock.Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>())).ReturnsAsync(6.25m);
        _orderRepositoryMock.Setup(x => x.CountByOrderNumberPrefixAsync(It.IsAny<string>())).ReturnsAsync(0);
        _orderRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Order>())).ReturnsAsync((Order o) => o);

        // Act
        var result = await _service.CreateOrderAsync(dto, userId);

        // Assert
        result.EstimatedProductionDays.Should().Be(14); // Máximo de ambos productos
    }

    #endregion

    #region ValidateOrderProductsAsync Tests

    [Fact]
    public async Task CreateOrderAsync_WithNonExistentProduct_ThrowsException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var dto = CreateValidOrderDto(productId);

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync((Product?)null);

        // Act
        Func<Task> act = async () => await _service.CreateOrderAsync(dto, userId);

        // Assert
        // CreateOrderAsync debería fallar cuando no encuentra el producto
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*no encontrado*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_WithInactiveProduct_ThrowsException()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);
        product.IsActive = false;

        var dto = CreateValidOrderDto(productId);

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*no está disponible para pedidos*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_WithIncorrectPrice_ThrowsException()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m); // 299.99 con IVA

        var dto = CreateValidOrderDto(productId);
        dto.OrderItems.First().UnitPrice = 500m; // Precio manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Precio incorrecto*");
    }

    #endregion

    #region GenerateUniqueOrderNumberAsync Tests

    [Fact]
    public async Task GenerateUniqueOrderNumberAsync_GeneratesCorrectFormat()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(x => x.CountByOrderNumberPrefixAsync(It.IsAny<string>()))
            .ReturnsAsync(42);

        // Act
        var result = await _service.GenerateUniqueOrderNumberAsync();

        // Assert
        result.Should().MatchRegex(@"ORD-\d{8}-0043"); // 42 + 1 = 43
        result.Should().Contain(DateTime.UtcNow.ToString("yyyyMMdd"));
    }

    #endregion

    #region Helper Methods

    private Product CreateTestProduct(Guid id, string sku, decimal basePrice)
    {
        return new Product
        {
            Id = id,
            Sku = sku,
            BasePrice = basePrice,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 7,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private CreateOrderDto CreateValidOrderDto(Guid productId)
    {
        return new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 123",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 299.99m,
            VatAmount = 63.00m, // 21% de 299.99
            ShippingCost = 6.25m,
            TotalAmount = 369.24m, // 299.99 + 63.00 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,
                    LineTotal = 299.99m
                }
            }
        };
    }

    #endregion
}
