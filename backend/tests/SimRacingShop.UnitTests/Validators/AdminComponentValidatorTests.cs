using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CreateComponentDtoValidatorTests
{
    private readonly Mock<IComponentAdminRepository> _repoMock;
    private readonly CreateComponentDtoValidator _validator;

    public CreateComponentDtoValidatorTests()
    {
        _repoMock = new Mock<IComponentAdminRepository>();
        _repoMock.Setup(r => r.SkuExists(It.IsAny<string>())).Returns(false);
        _validator = new CreateComponentDtoValidator(_repoMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            StockQuantity = 10,
            MinStockThreshold = 5,
            CostPrice = 15.00m,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Grip Estándar" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptySku_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "",
            ComponentType = "grip",
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Sku);
    }

    [Fact]
    public async Task DuplicateSku_FailsValidation()
    {
        _repoMock.Setup(r => r.SkuExists("COMP-DUP")).Returns(true);

        var dto = new CreateComponentDto
        {
            Sku = "COMP-DUP",
            ComponentType = "grip",
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Sku)
            .WithErrorMessage("Ya existe un componente con este SKU.");
    }

    [Fact]
    public async Task EmptyComponentType_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "",
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.ComponentType);
    }

    [Fact]
    public async Task NegativeStockQuantity_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            StockQuantity = -1,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Fact]
    public async Task NegativeMinStockThreshold_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            MinStockThreshold = -5,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.MinStockThreshold);
    }

    [Fact]
    public async Task NegativeCostPrice_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            CostPrice = -10.00m,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.CostPrice);
    }

    [Fact]
    public async Task NullCostPrice_PassesValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            CostPrice = null,
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveValidationErrorFor(x => x.CostPrice);
    }

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            Translations = new List<ComponentTranslationInputDto>()
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations);
    }

    [Fact]
    public async Task TranslationWithEmptyName_FailsValidation()
    {
        var dto = new CreateComponentDto
        {
            Sku = "COMP-001",
            ComponentType = "grip",
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Name");
    }
}

public class UpdateComponentDtoValidatorTests
{
    private readonly UpdateComponentDtoValidator _validator = new();

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new UpdateComponentDto
        {
            ComponentType = "grip",
            StockQuantity = 10,
            MinStockThreshold = 5,
            CostPrice = 15.00m
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task NegativeStockQuantity_FailsValidation()
    {
        var dto = new UpdateComponentDto
        {
            ComponentType = "grip",
            StockQuantity = -1
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Fact]
    public async Task NegativeCostPrice_FailsValidation()
    {
        var dto = new UpdateComponentDto
        {
            ComponentType = "grip",
            CostPrice = -5.00m
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.CostPrice);
    }

    [Fact]
    public async Task EmptyComponentType_FailsValidation()
    {
        var dto = new UpdateComponentDto { ComponentType = "" };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.ComponentType);
    }
}

public class UpdateStockDtoValidatorTests
{
    private readonly UpdateStockDtoValidator _validator = new();

    [Fact]
    public async Task ValidQuantity_PassesValidation()
    {
        var dto = new UpdateStockDto { Quantity = 50 };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task ZeroQuantity_PassesValidation()
    {
        var dto = new UpdateStockDto { Quantity = 0 };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task NegativeQuantity_FailsValidation()
    {
        var dto = new UpdateStockDto { Quantity = -1 };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }
}

public class UpdateComponentTranslationsDtoValidatorTests
{
    private readonly UpdateComponentTranslationsDtoValidator _validator = new();

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new UpdateComponentTranslationsDto { Translations = new() };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations);
    }

    [Fact]
    public async Task ValidTranslations_PassesValidation()
    {
        var dto = new UpdateComponentTranslationsDto
        {
            Translations = new List<ComponentTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
