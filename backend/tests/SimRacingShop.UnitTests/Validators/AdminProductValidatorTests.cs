using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CreateProductDtoValidatorTests
{
    private readonly Mock<IProductAdminRepository> _repoMock;
    private readonly CreateProductDtoValidator _validator;

    public CreateProductDtoValidatorTests()
    {
        _repoMock = new Mock<IProductAdminRepository>();
        _repoMock.Setup(r => r.SkuExists(It.IsAny<string>())).Returns(false);
        _validator = new CreateProductDtoValidator(_repoMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 299.99m,
            VatRate = 21,
            BaseProductionDays = 7,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Volante", Slug = "volante" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task EmptySku_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Sku);
    }

    [Fact]
    public async Task SkuTooLong_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = new string('A', 51),
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Sku);
    }

    [Fact]
    public async Task DuplicateSku_FailsValidation()
    {
        _repoMock.Setup(r => r.SkuExists("SKU-DUP")).Returns(true);

        var dto = new CreateProductDto
        {
            Sku = "SKU-DUP",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Sku)
            .WithErrorMessage("Ya existe un producto con este SKU.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100.50)]
    public async Task ZeroOrNegativeBasePrice_FailsValidation(decimal price)
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = price,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.BasePrice);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public async Task VatRateOutOfRange_FailsValidation(decimal vatRate)
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            VatRate = vatRate,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.VatRate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(366)]
    public async Task BaseProductionDaysOutOfRange_FailsValidation(int days)
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            BaseProductionDays = days,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.BaseProductionDays);
    }

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>()
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations);
    }

    [Fact]
    public async Task TranslationWithEmptyLocale_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Locale");
    }

    [Fact]
    public async Task TranslationWithEmptyName_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Name");
    }

    [Fact]
    public async Task TranslationWithEmptySlug_FailsValidation()
    {
        var dto = new CreateProductDto
        {
            Sku = "SKU-001",
            BasePrice = 100,
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Slug");
    }
}

public class UpdateProductDtoValidatorTests
{
    private readonly UpdateProductDtoValidator _validator = new();

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new UpdateProductDto
        {
            BasePrice = 299.99m,
            VatRate = 21,
            BaseProductionDays = 7
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task NegativeBasePrice_FailsValidation()
    {
        var dto = new UpdateProductDto { BasePrice = -10 };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.BasePrice);
    }

    [Fact]
    public async Task VatRateAbove100_FailsValidation()
    {
        var dto = new UpdateProductDto { BasePrice = 100, VatRate = 150 };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.VatRate);
    }
}

public class UpdateTranslationsDtoValidatorTests
{
    private readonly UpdateTranslationsDtoValidator _validator = new();

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new UpdateProductTranslationsDto { Translations = new() };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations);
    }

    [Fact]
    public async Task ValidTranslations_PassesValidation()
    {
        var dto = new UpdateProductTranslationsDto
        {
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
