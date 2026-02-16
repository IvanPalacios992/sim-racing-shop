using FluentAssertions;
using FluentValidation.TestHelper;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CalculateShippingRequestDtoValidatorTests
{
    private readonly CalculateShippingRequestDtoValidator _validator;

    public CalculateShippingRequestDtoValidatorTests()
    {
        _validator = new CalculateShippingRequestDtoValidator();
    }

    [Fact]
    public async Task ValidRequest_PassesValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = 100m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyPostalCode_FailsValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "",
            Subtotal = 100m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode)
            .WithErrorMessage("El código postal es obligatorio");
    }

    [Fact]
    public async Task InvalidPostalCodeFormat_FailsValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "280", // Menos de 5 dígitos
            Subtotal = 100m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode)
            .WithErrorMessage("El código postal debe tener 5 dígitos");
    }

    [Theory]
    [InlineData("2800A")]
    [InlineData("AB123")]
    [InlineData("28-001")]
    public async Task PostalCodeWithNonDigits_FailsValidation(string postalCode)
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = postalCode,
            Subtotal = 100m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode);
    }

    [Fact]
    public async Task NegativeSubtotal_FailsValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = -10m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Subtotal)
            .WithErrorMessage("El subtotal no puede ser negativo");
    }

    [Fact]
    public async Task NegativeWeight_FailsValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = 100m,
            WeightKg = -1m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WeightKg)
            .WithErrorMessage("El peso no puede ser negativo");
    }

    [Fact]
    public async Task WeightExceedsMaximum_FailsValidation()
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = "28001",
            Subtotal = 100m,
            WeightKg = 1001m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WeightKg)
            .WithErrorMessage("El peso máximo es 1000 kg");
    }

    [Theory]
    [InlineData("28001")] // Madrid - Península
    [InlineData("07001")] // Baleares
    [InlineData("35001")] // Las Palmas - Canarias
    [InlineData("38001")] // Santa Cruz - Canarias
    public async Task ValidSpanishPostalCodes_PassValidation(string postalCode)
    {
        // Arrange
        var dto = new CalculateShippingRequestDto
        {
            PostalCode = postalCode,
            Subtotal = 100m,
            WeightKg = 2.5m
        };

        // Act
        var result = await _validator.TestValidateAsync(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}
