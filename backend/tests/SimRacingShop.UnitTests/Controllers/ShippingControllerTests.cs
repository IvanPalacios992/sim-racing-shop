using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Services;

namespace SimRacingShop.UnitTests.Controllers;

public class ShippingControllerTests
{
    private readonly Mock<IShippingService> _shippingServiceMock;
    private readonly Mock<ILogger<ShippingController>> _loggerMock;
    private readonly ShippingController _controller;

    public ShippingControllerTests()
    {
        _shippingServiceMock = new Mock<IShippingService>();
        _loggerMock = new Mock<ILogger<ShippingController>>();
        _controller = new ShippingController(_shippingServiceMock.Object, _loggerMock.Object);
    }

    #region CalculateShipping Tests

    [Fact]
    public async Task CalculateShipping_WithValidRequest_ReturnsOkWithCalculation()
    {
        // Arrange
        var request = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = 85.50m,
            WeightKg = 2.5m
        };

        var expectedResult = new ShippingCalculationDto
        {
            ZoneName = "Península",
            BaseCost = 5.00m,
            WeightCost = 1.25m,
            TotalCost = 6.25m,
            WeightKg = 2.5m,
            IsFreeShipping = false,
            FreeShippingThreshold = 100.00m,
            SubtotalNeededForFreeShipping = 14.50m
        };

        _shippingServiceMock
            .Setup(x => x.GetShippingDetailsAsync(request.PostalCode, request.Subtotal, request.WeightKg))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CalculateShipping(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        var calculation = okResult.Value.Should().BeOfType<ShippingCalculationDto>().Subject;
        calculation.TotalCost.Should().Be(6.25m);
        calculation.ZoneName.Should().Be("Península");
    }

    [Fact]
    public async Task CalculateShipping_WithFreeShippingEligible_ReturnsZeroCost()
    {
        // Arrange
        var request = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = 120m,
            WeightKg = 3m
        };

        var expectedResult = new ShippingCalculationDto
        {
            ZoneName = "Península",
            BaseCost = 0m,
            WeightCost = 0m,
            TotalCost = 0m,
            WeightKg = 3m,
            IsFreeShipping = true,
            FreeShippingThreshold = 100.00m,
            SubtotalNeededForFreeShipping = 0m
        };

        _shippingServiceMock
            .Setup(x => x.GetShippingDetailsAsync(request.PostalCode, request.Subtotal, request.WeightKg))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.CalculateShipping(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var calculation = okResult.Value.Should().BeOfType<ShippingCalculationDto>().Subject;
        calculation.IsFreeShipping.Should().BeTrue();
        calculation.TotalCost.Should().Be(0m);
    }

    [Fact]
    public async Task CalculateShipping_WithInvalidPostalCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new CalculateShippingRequestDto
        {
            PostalCode = "99999",
            Subtotal = 100m,
            WeightKg = 2m
        };

        _shippingServiceMock
            .Setup(x => x.GetShippingDetailsAsync(request.PostalCode, request.Subtotal, request.WeightKg))
            .ThrowsAsync(new InvalidOperationException("No se encontró configuración de envío"));

        // Act
        var result = await _controller.CalculateShipping(request);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region GetShippingZones Tests

    [Fact]
    public async Task GetShippingZones_ReturnsAllActiveZones()
    {
        // Arrange
        var zones = new List<ShippingZone>
        {
            new ShippingZone
            {
                Id = Guid.NewGuid(),
                Name = "Península",
                BaseCost = 5.00m,
                CostPerKg = 0.50m,
                FreeShippingThreshold = 100.00m,
                IsActive = true
            },
            new ShippingZone
            {
                Id = Guid.NewGuid(),
                Name = "Baleares",
                BaseCost = 10.00m,
                CostPerKg = 1.00m,
                FreeShippingThreshold = 150.00m,
                IsActive = true
            }
        };

        _shippingServiceMock
            .Setup(x => x.GetActiveShippingZonesAsync())
            .ReturnsAsync(zones);

        // Act
        var result = await _controller.GetShippingZones();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var zoneDtos = okResult.Value.Should().BeAssignableTo<IEnumerable<ShippingZoneDto>>().Subject;
        zoneDtos.Should().HaveCount(2);
        zoneDtos.Should().Contain(z => z.Name == "Península");
        zoneDtos.Should().Contain(z => z.Name == "Baleares");
    }

    #endregion

    #region GetShippingZoneByPostalCode Tests

    [Fact]
    public async Task GetShippingZoneByPostalCode_WithValidCode_ReturnsZone()
    {
        // Arrange
        var postalCode = "28001";
        var zone = new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Península",
            BaseCost = 5.00m,
            CostPerKg = 0.50m,
            FreeShippingThreshold = 100.00m,
            IsActive = true
        };

        _shippingServiceMock
            .Setup(x => x.GetShippingZoneByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _controller.GetShippingZoneByPostalCode(postalCode);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var zoneDto = okResult.Value.Should().BeOfType<ShippingZoneDto>().Subject;
        zoneDto.Name.Should().Be("Península");
        zoneDto.BaseCost.Should().Be(5.00m);
    }

    [Fact]
    public async Task GetShippingZoneByPostalCode_WithNonExistentCode_ReturnsNotFound()
    {
        // Arrange
        var postalCode = "99999";

        _shippingServiceMock
            .Setup(x => x.GetShippingZoneByPostalCodeAsync(postalCode))
            .ReturnsAsync((ShippingZone?)null);

        // Act
        var result = await _controller.GetShippingZoneByPostalCode(postalCode);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.StatusCode.Should().Be(404);
    }

    [Theory]
    [InlineData("07001")] // Baleares
    [InlineData("35001")] // Canarias - Las Palmas
    [InlineData("38001")] // Canarias - Santa Cruz
    public async Task GetShippingZoneByPostalCode_WithDifferentZones_ReturnsCorrectZone(string postalCode)
    {
        // Arrange
        var zoneName = postalCode.StartsWith("07") ? "Baleares" : "Canarias";
        var zone = new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = zoneName,
            BaseCost = postalCode.StartsWith("07") ? 10.00m : 15.00m,
            CostPerKg = postalCode.StartsWith("07") ? 1.00m : 1.50m,
            FreeShippingThreshold = postalCode.StartsWith("07") ? 150.00m : 200.00m,
            IsActive = true
        };

        _shippingServiceMock
            .Setup(x => x.GetShippingZoneByPostalCodeAsync(postalCode))
            .ReturnsAsync(zone);

        // Act
        var result = await _controller.GetShippingZoneByPostalCode(postalCode);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var zoneDto = okResult.Value.Should().BeOfType<ShippingZoneDto>().Subject;
        zoneDto.Name.Should().Be(zoneName);
    }

    #endregion
}
