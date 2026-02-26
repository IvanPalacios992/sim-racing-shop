using FluentAssertions;
using FluentValidation.TestHelper;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CreateOrderItemDtoValidatorTests
{
    private readonly CreateOrderItemDtoValidator _validator;

    public CreateOrderItemDtoValidatorTests()
    {
        _validator = new CreateOrderItemDtoValidator();
    }

    [Fact]
    public async Task ValidOrderItem_PassesValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "Volante SimRacing Pro",
            ProductSku = "VOL-001",
            ConfigurationJson = "{\"color\":\"negro\"}",
            Quantity = 2,
            UnitPrice = 299.99m,
            UnitSubtotal = 247.93m,
            LineTotal = 599.98m,
            LineSubtotal = 495.86m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyProductId_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.Empty,
            ProductName = "Test",
            ProductSku = "TEST-001",
            Quantity = 1,
            UnitPrice = 100m,
            LineTotal = 100m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ProductId);
    }

    [Fact]
    public async Task EmptyProductName_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "",
            ProductSku = "TEST-001",
            Quantity = 1,
            UnitPrice = 100m,
            LineTotal = 100m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ProductName)
            .WithErrorMessage("El nombre del producto es obligatorio");
    }

    [Fact]
    public async Task ZeroQuantity_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "Test",
            ProductSku = "TEST-001",
            Quantity = 0,
            UnitPrice = 100m,
            LineTotal = 0m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Quantity)
            .WithErrorMessage("La cantidad debe ser mayor a 0");
    }

    [Fact]
    public async Task QuantityExceedsMaximum_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "Test",
            ProductSku = "TEST-001",
            Quantity = 101,
            UnitPrice = 100m,
            LineTotal = 10100m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Quantity)
            .WithErrorMessage("La cantidad máxima por producto es 100");
    }

    [Fact]
    public async Task NegativeUnitPrice_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "Test",
            ProductSku = "TEST-001",
            Quantity = 1,
            UnitPrice = -10m,
            LineTotal = -10m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.UnitPrice);
    }

    [Fact]
    public async Task LineTotalDoesNotMatchQuantityTimesPrice_FailsValidation()
    {
        // Arrange
        var dto = new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = "Test",
            ProductSku = "TEST-001",
            Quantity = 2,
            UnitPrice = 100m,
            LineTotal = 150m // Debería ser 200
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x)
            .WithErrorMessage("El total de línea no coincide con cantidad × precio unitario");
    }
}

public class CreateOrderDtoValidatorTests
{
    private readonly CreateOrderDtoValidator _validator;

    public CreateOrderDtoValidatorTests()
    {
        _validator = new CreateOrderDtoValidator();
    }

    [Fact]
    public async Task ValidOrder_PassesValidation()
    {
        // Arrange
        var dto = new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 123",
            ShippingCity = "Madrid",
            ShippingState = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 247.93m,      // Suma de LineSubtotal (sin IVA)
            VatAmount = 52.07m,      // 21% de 247.93
            ShippingCost = 10m,
            TotalAmount = 310.00m,   // 247.93 + 52.07 + 10
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = "Test Product",
                    ProductSku = "TEST-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,     // Con IVA
                    UnitSubtotal = 247.93m,  // Sin IVA
                    LineTotal = 299.99m,     // Con IVA
                    LineSubtotal = 247.93m   // Sin IVA
                }
            }
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyShippingStreet_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.ShippingStreet = "";

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShippingStreet);
    }

    [Fact]
    public async Task InvalidCountryCode_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.ShippingCountry = "ESP"; // Debería ser 2 caracteres

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShippingCountry)
            .WithErrorMessage("El código de país debe tener 2 caracteres (ISO)");
    }

    [Fact]
    public async Task NegativeSubtotal_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.Subtotal = -100m;

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Subtotal);
    }

    [Fact]
    public async Task EmptyOrderItems_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.OrderItems = new List<CreateOrderItemDto>();

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderItems)
            .WithErrorMessage("El pedido debe contener al menos un artículo");
    }

    [Fact]
    public async Task TooManyOrderItems_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.OrderItems = Enumerable.Range(0, 51).Select(i => new CreateOrderItemDto
        {
            ProductId = Guid.NewGuid(),
            ProductName = $"Product {i}",
            ProductSku = $"PROD-{i:D3}",
            Quantity = 1,
            UnitPrice = 10m,
            LineTotal = 10m
        }).ToList();

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderItems)
            .WithErrorMessage("El pedido no puede contener más de 50 artículos diferentes");
    }

    [Fact]
    public async Task SubtotalDoesNotMatchItemsSum_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.Subtotal = 500m; // No coincide con los items

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x)
            .WithErrorMessage("El subtotal no coincide con la suma de los artículos");
    }

    [Fact]
    public async Task TotalDoesNotMatchCalculation_FailsValidation()
    {
        // Arrange
        var dto = CreateValidOrder();
        dto.TotalAmount = 1000m; // No coincide con subtotal + IVA + envío

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x)
            .WithErrorMessage("El total no coincide con subtotal + IVA + envío");
    }

    private CreateOrderDto CreateValidOrder()
    {
        return new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 123",
            ShippingCity = "Madrid",
            ShippingState = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 247.93m,      // Suma de LineSubtotal (sin IVA)
            VatAmount = 52.07m,      // 21% de 247.93
            ShippingCost = 10m,
            TotalAmount = 310.00m,   // 247.93 + 52.07 + 10
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = "Test Product",
                    ProductSku = "TEST-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,     // Con IVA
                    UnitSubtotal = 247.93m,  // Sin IVA
                    LineTotal = 299.99m,     // Con IVA
                    LineSubtotal = 247.93m   // Sin IVA
                }
            }
        };
    }
}
