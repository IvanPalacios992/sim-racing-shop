using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CreateBillingAddressDtoValidatorTests
{
    private readonly Mock<IUserAddressRepository> _repositoryMock;
    private readonly CreateBillingAddressDtoValidator _validator;

    public CreateBillingAddressDtoValidatorTests()
    {
        _repositoryMock = new Mock<IUserAddressRepository>();
        _repositoryMock.Setup(r => r.ExistBillingAddressForUser(It.IsAny<Guid>())).Returns(false);
        _validator = new CreateBillingAddressDtoValidator(_repositoryMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "Madrid",
            State = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyStreet_FailsValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Street)
            .WithErrorMessage("La calle no debe ser vacia.");
    }

    [Fact]
    public async Task EmptyCity_FailsValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.City)
            .WithErrorMessage("La ciudad no debe ser vacia.");
    }

    [Fact]
    public async Task EmptyPostalCode_FailsValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode)
            .WithErrorMessage("El código postal no debe ser vacio.");
    }

    [Fact]
    public async Task EmptyCountry_FailsValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = ""
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Country)
            .WithErrorMessage("El país no debe ser vacio.");
    }

    [Fact]
    public async Task ExistingBillingAddressForUser_FailsValidation()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _repositoryMock.Setup(r => r.ExistBillingAddressForUser(userId)).Returns(true);

        var dto = new CreateBillingAddressDto
        {
            UserId = userId,
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.UserId)
            .WithErrorMessage("Ya existe una dirección de facturación para este usuario");
    }

    [Fact]
    public async Task StateCanBeEmpty_PassesValidation()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "Madrid",
            State = null,
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.State);
    }
}

public class UpdateBillingAddressDtoValidatorTests
{
    private readonly Mock<ICategoryAdminRepository> _repositoryMock;
    private readonly UpdateBillingAddressDtoValidator _validator;

    public UpdateBillingAddressDtoValidatorTests()
    {
        _repositoryMock = new Mock<ICategoryAdminRepository>();
        _validator = new UpdateBillingAddressDtoValidator(_repositoryMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "Updated Street 456",
            City = "Barcelona",
            State = "Barcelona",
            PostalCode = "08001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyStreet_FailsValidation()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Street)
            .WithErrorMessage("La calle no debe ser vacia.");
    }

    [Fact]
    public async Task EmptyCity_FailsValidation()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "Street 123",
            City = "",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.City);
    }

    [Fact]
    public async Task EmptyPostalCode_FailsValidation()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode);
    }

    [Fact]
    public async Task EmptyCountry_FailsValidation()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = ""
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Country);
    }
}

public class CreateDeliveryAddressDtoValidatorTests
{
    private readonly Mock<IUserAddressRepository> _repositoryMock;
    private readonly CreateDeliveryAddressDtoValidator _validator;

    public CreateDeliveryAddressDtoValidatorTests()
    {
        _repositoryMock = new Mock<IUserAddressRepository>();
        _validator = new CreateDeliveryAddressDtoValidator(_repositoryMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "Main Street 123",
            City = "Madrid",
            State = "Madrid",
            PostalCode = "28001",
            Country = "ES",
            IsDefault = true
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyName_FailsValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "",
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("La direción debe tener un nombre.");
    }

    [Fact]
    public async Task EmptyStreet_FailsValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Street);
    }

    [Fact]
    public async Task EmptyCity_FailsValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "Street 123",
            City = "",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.City);
    }

    [Fact]
    public async Task EmptyPostalCode_FailsValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode);
    }

    [Fact]
    public async Task EmptyCountry_FailsValidation()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = ""
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Country);
    }
}

public class UpdateDeliveryAddressDtoValidatorTests
{
    private readonly Mock<ICategoryAdminRepository> _repositoryMock;
    private readonly UpdateDeliveryAddressDtoValidator _validator;

    public UpdateDeliveryAddressDtoValidatorTests()
    {
        _repositoryMock = new Mock<ICategoryAdminRepository>();
        _validator = new UpdateDeliveryAddressDtoValidator(_repositoryMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Office",
            Street = "Updated Street 456",
            City = "Barcelona",
            State = "Barcelona",
            PostalCode = "08001",
            Country = "ES",
            IsDefault = false
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptyName_FailsValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "",
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("La direción debe tener un nombre.");
    }

    [Fact]
    public async Task EmptyStreet_FailsValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Home",
            Street = "",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Street);
    }

    [Fact]
    public async Task EmptyCity_FailsValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Home",
            Street = "Street 123",
            City = "",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.City);
    }

    [Fact]
    public async Task EmptyPostalCode_FailsValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Home",
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "",
            Country = "ES"
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.PostalCode);
    }

    [Fact]
    public async Task EmptyCountry_FailsValidation()
    {
        // Arrange
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Home",
            Street = "Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = ""
        };

        // Act
        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Country);
    }
}
