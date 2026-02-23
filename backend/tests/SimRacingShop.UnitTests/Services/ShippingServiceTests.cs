using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Services;

namespace SimRacingShop.UnitTests.Services;

public class ShippingServiceTests
{
    private readonly Mock<IShippingZoneRepository> _shippingZoneRepositoryMock;
    private readonly Mock<ILogger<ShippingService>> _loggerMock;
    private readonly ShippingService _service;

    public ShippingServiceTests()
    {
        _shippingZoneRepositoryMock = new Mock<IShippingZoneRepository>();
        _loggerMock = new Mock<ILogger<ShippingService>>();
        _service = new ShippingService(_shippingZoneRepositoryMock.Object, _loggerMock.Object);
    }

    #region CalculateShippingCostAsync Tests

    [Fact]
    public async Task CalculateShippingCostAsync_WithPeninsulaPostalCode_ReturnsCorrectCost()
    {
        // Arrange
        var postalCode = "28001";
        var subtotal = 50m;
        var weightKg = 2.5m;
        var zone = CreatePeninsulaZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        // Base: 5€ + (2.5kg × 0.50€) = 6.25€
        result.Should().Be(6.25m);
    }

    [Fact]
    public async Task CalculateShippingCostAsync_WithBalearePostalCode_ReturnsCorrectCost()
    {
        // Arrange
        var postalCode = "07001";
        var subtotal = 50m;
        var weightKg = 3m;
        var zone = CreateBaleareZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        // Base: 10€ + (3kg × 1€) = 13€
        result.Should().Be(13m);
    }

    [Fact]
    public async Task CalculateShippingCostAsync_WithCanariasPostalCode_ReturnsCorrectCost()
    {
        // Arrange
        var postalCode = "35001";
        var subtotal = 50m;
        var weightKg = 2m;
        var zone = CreateCanariasZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        // Base: 15€ + (2kg × 1.50€) = 18€
        result.Should().Be(18m);
    }

    [Fact]
    public async Task CalculateShippingCostAsync_WhenSubtotalExceedsFreeShippingThreshold_ReturnsFree()
    {
        // Arrange
        var postalCode = "28001";
        var subtotal = 150m; // > 100€ threshold
        var weightKg = 5m;
        var zone = CreatePeninsulaZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        result.Should().Be(0m);
    }

    [Fact]
    public async Task CalculateShippingCostAsync_WithZeroWeight_ReturnsOnlyBaseCost()
    {
        // Arrange
        var postalCode = "28001";
        var subtotal = 50m;
        var weightKg = 0m;
        var zone = CreatePeninsulaZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        result.Should().Be(zone.BaseCost);
    }

    [Fact]
    public async Task CalculateShippingCostAsync_WithNonExistentPostalCode_ThrowsException()
    {
        // Arrange
        var postalCode = "99999";
        var subtotal = 50m;
        var weightKg = 2m;

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync((ShippingZone?)null);

        // Act
        Func<Task> act = async () => await _service.CalculateShippingCostAsync(postalCode, subtotal, weightKg);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"No se encontró configuración de envío para el código postal {postalCode}");
    }

    #endregion

    #region GetShippingDetailsAsync Tests

    [Fact]
    public async Task GetShippingDetailsAsync_WithValidData_ReturnsDetailedCalculation()
    {
        // Arrange
        var postalCode = "28001";
        var subtotal = 80m;
        var weightKg = 2.5m;
        var zone = CreatePeninsulaZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.GetShippingDetailsAsync(postalCode, subtotal, weightKg);

        // Assert
        result.Should().NotBeNull();
        result.ZoneName.Should().Be("Península");
        result.BaseCost.Should().Be(5m);
        result.WeightCost.Should().Be(1.25m); // 2.5kg × 0.50€
        result.TotalCost.Should().Be(6.25m);
        result.WeightKg.Should().Be(2.5m);
        result.IsFreeShipping.Should().BeFalse();
        result.FreeShippingThreshold.Should().Be(100m);
        result.SubtotalNeededForFreeShipping.Should().Be(20m); // 100 - 80
    }

    [Fact]
    public async Task GetShippingDetailsAsync_WithFreeShipping_ReturnsZeroCosts()
    {
        // Arrange
        var postalCode = "28001";
        var subtotal = 120m; // > 100€ threshold
        var weightKg = 3m;
        var zone = CreatePeninsulaZone();

        _shippingZoneRepositoryMock
            .Setup(x => x.GetByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _service.GetShippingDetailsAsync(postalCode, subtotal, weightKg);

        // Assert
        result.BaseCost.Should().Be(0m);
        result.WeightCost.Should().Be(0m);
        result.TotalCost.Should().Be(0m);
        result.IsFreeShipping.Should().BeTrue();
        result.SubtotalNeededForFreeShipping.Should().Be(0m);
    }

    #endregion

    #region GetActiveShippingZonesAsync Tests

    [Fact]
    public async Task GetActiveShippingZonesAsync_ReturnsAllActiveZones()
    {
        // Arrange
        var zones = new List<ShippingZone>
        {
            CreatePeninsulaZone(),
            CreateBaleareZone(),
            CreateCanariasZone()
        };

        _shippingZoneRepositoryMock
            .Setup(x => x.GetAllActiveAsync())
            .ReturnsAsync(zones);

        // Act
        var result = await _service.GetActiveShippingZonesAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(z => z.Name == "Península");
        result.Should().Contain(z => z.Name == "Baleares");
        result.Should().Contain(z => z.Name == "Canarias");
    }

    #endregion

    #region Helper Methods

    private ShippingZone CreatePeninsulaZone()
    {
        return new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Península",
            PostalCodePrefixes = "01,02,03,28,29,30",
            BaseCost = 5.00m,
            CostPerKg = 0.50m,
            FreeShippingThreshold = 100.00m,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private ShippingZone CreateBaleareZone()
    {
        return new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Baleares",
            PostalCodePrefixes = "07",
            BaseCost = 10.00m,
            CostPerKg = 1.00m,
            FreeShippingThreshold = 150.00m,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private ShippingZone CreateCanariasZone()
    {
        return new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Canarias",
            PostalCodePrefixes = "35,38",
            BaseCost = 15.00m,
            CostPerKg = 1.50m,
            FreeShippingThreshold = 200.00m,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion
}
