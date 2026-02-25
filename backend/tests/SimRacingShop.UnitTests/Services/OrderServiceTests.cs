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
    private readonly Mock<IComponentRepository> _componentRepositoryMock;
    private readonly Mock<IShippingService> _shippingServiceMock;
    private readonly Mock<ILogger<OrderService>> _loggerMock;
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _productRepositoryMock = new Mock<IProductAdminRepository>();
        _componentRepositoryMock = new Mock<IComponentRepository>();
        _shippingServiceMock = new Mock<IShippingService>();
        _loggerMock = new Mock<ILogger<OrderService>>();
        _service = new OrderService(
            _orderRepositoryMock.Object,
            _productRepositoryMock.Object,
            _componentRepositoryMock.Object,
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
            Subtotal = 247.93m,      // Suma de LineSubtotal (sin IVA)
            VatAmount = 52.07m,      // 21% de 247.93
            ShippingCost = 6.25m,
            TotalAmount = 306.25m,   // 247.93 + 52.07 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,     // Con IVA (247.93 * 1.21 ≈ 300.00, dentro de tolerancia)
                    UnitSubtotal = 247.93m,  // Sin IVA
                    LineTotal = 299.99m,     // Con IVA
                    LineSubtotal = 247.93m   // Sin IVA
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
        result.Subtotal.Should().BeApproximately(247.93m, 0.02m); // Subtotal sin IVA
        result.TotalAmount.Should().BeApproximately(306.25m, 0.02m); // 247.93 + 52.07 + 6.25

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
            Subtotal = 250.00m,      // 100 + 150 (suma de LineSubtotal sin IVA)
            VatAmount = 52.50m,      // 21% de 250.00
            ShippingCost = 6.25m,
            TotalAmount = 308.75m,   // 250.00 + 52.50 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = product1Id,
                    ProductName = "Product 1",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 121m,        // 100 * 1.21
                    UnitSubtotal = 100m,
                    LineTotal = 121m,
                    LineSubtotal = 100m
                },
                new CreateOrderItemDto
                {
                    ProductId = product2Id,
                    ProductName = "Product 2",
                    ProductSku = "VOL-002",
                    Quantity = 1,
                    UnitPrice = 181.50m,     // 150 * 1.21
                    UnitSubtotal = 150m,
                    LineTotal = 181.50m,
                    LineSubtotal = 150m
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

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Precio unitario incorrecto*");
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

    #region ValidateOrderProductsAsync — SKU y totales

    [Fact]
    public async Task ValidateOrderProductsAsync_SkuNoConcuerda_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.OrderItems.First().ProductSku = "SKU-ERRONEO"; // SKU manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*SKU*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_SubtotalIncorrecto_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.Subtotal = 999m; // subtotal manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Subtotal incorrecto*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_IvaIncorrecto_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.VatAmount = 1m; // IVA manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*IVA incorrecto*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_EnvioIncorrecto_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.ShippingCost = 99m; // envío manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m); // backend calcula 6.25, frontend envió 99

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Coste de envío incorrecto*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_TotalIncorrecto_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.TotalAmount = 1m; // total manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Total incorrecto*");
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_TotalLineaIncorrecto_LanzaExcepcion()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 247.93m);

        var dto = CreateValidOrderDto(productId);
        dto.OrderItems.First().LineTotal = 999m; // total línea manipulado

        _productRepositoryMock
            .Setup(x => x.GetByIdAsync(productId))
            .ReturnsAsync(product);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        // Act
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Total de línea incorrecto*");
    }

    #endregion

    #region CreateOrderAsync con componentes seleccionados

    [Fact]
    public async Task CreateOrderAsync_ConComponentesSeleccionados_CalculaPrecioConModificador()
    {
        // Arrange – producto base 100€ + IVA 21%; componente seleccionado suma 20€ al precio base
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var componentId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 100m); // BasePrice=100, VatRate=21

        // Con modificador +20 → unitSubtotal=120, unitPrice=120*1.21=145.20
        var dto = new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 1",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 120m,          // lineSubtotal sin IVA
            VatAmount = 25.20m,       // 21% de 120
            ShippingCost = 6.25m,
            TotalAmount = 151.45m,    // 120 + 25.20 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Volante Test",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 145.20m,         // 120 * 1.21
                    UnitSubtotal = 120m,          // 100 + 20 (modificador)
                    LineTotal = 145.20m,
                    LineSubtotal = 120m,
                    SelectedComponentIds = new List<Guid> { componentId }
                }
            }
        };

        _productRepositoryMock.Setup(x => x.GetByIdAsync(productId)).ReturnsAsync(product);

        // El componente seleccionado añade 20€ al precio
        _componentRepositoryMock
            .Setup(x => x.GetPriceModifiersSumAsync(productId, It.IsAny<List<Guid>>()))
            .ReturnsAsync(20m);

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

        // Assert – el precio del item debe incluir el modificador del componente
        result.Should().NotBeNull();
        result.OrderItems.Should().HaveCount(1);
        // CalculateProductPriceAsync: (100 + 20) * 1.21 = 145.20
        result.OrderItems[0].UnitPrice.Should().BeApproximately(145.20m, 0.02m);

        _componentRepositoryMock.Verify(
            x => x.GetPriceModifiersSumAsync(productId, It.IsAny<List<Guid>>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task ValidateOrderProductsAsync_ConComponentesSeleccionados_ValidaPrecioConModificador()
    {
        // Arrange – producto 100€ base + componente +25€ → unitSubtotal=125, price=125*1.21=151.25
        var productId = Guid.NewGuid();
        var componentId = Guid.NewGuid();
        var product = CreateTestProduct(productId, "VOL-001", 100m);

        _componentRepositoryMock
            .Setup(x => x.GetPriceModifiersSumAsync(productId, It.IsAny<List<Guid>>()))
            .ReturnsAsync(25m);

        _shippingServiceMock
            .Setup(x => x.CalculateShippingCostAsync(It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .ReturnsAsync(6.25m);

        _productRepositoryMock.Setup(x => x.GetByIdAsync(productId)).ReturnsAsync(product);

        var dto = new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 1",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 125m,
            VatAmount = 26.25m,   // 21% de 125
            ShippingCost = 6.25m,
            TotalAmount = 157.50m,
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Volante Test",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 151.25m,         // 125 * 1.21
                    UnitSubtotal = 125m,
                    LineTotal = 151.25m,
                    LineSubtotal = 125m,
                    SelectedComponentIds = new List<Guid> { componentId }
                }
            }
        };

        // Act – no debe lanzar excepción porque los precios son correctos
        Func<Task> act = async () => await _service.ValidateOrderProductsAsync(dto);

        // Assert
        await act.Should().NotThrowAsync();
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
            Subtotal = 247.93m,      // LineSubtotal sin IVA
            VatAmount = 52.07m,      // 21% de 247.93
            ShippingCost = 6.25m,
            TotalAmount = 306.25m,   // 247.93 + 52.07 + 6.25
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,     // precio con IVA (247.93 * 1.21)
                    UnitSubtotal = 247.93m,  // precio sin IVA
                    LineTotal = 299.99m,     // total línea con IVA
                    LineSubtotal = 247.93m   // total línea sin IVA
                }
            }
        };
    }

    #endregion
}
