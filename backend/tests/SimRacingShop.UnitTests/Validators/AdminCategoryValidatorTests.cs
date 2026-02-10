using FluentAssertions;
using FluentValidation.TestHelper;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators;

public class CreateCategoryDtoValidatorTests
{
    private readonly Mock<ICategoryAdminRepository> _repoMock;
    private readonly CreateCategoryDtoValidator _validator;

    public CreateCategoryDtoValidatorTests()
    {
        _repoMock = new Mock<ICategoryAdminRepository>();
        _repoMock.Setup(r => r.ParentCategoryExists(It.IsAny<Guid?>())).Returns(true);
        _validator = new CreateCategoryDtoValidator(_repoMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Volantes", Slug = "volantes" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task ValidDto_WithParentCategory_PassesValidation()
    {
        var parentId = Guid.NewGuid();
        _repoMock.Setup(r => r.ParentCategoryExists(parentId)).Returns(true);

        var dto = new CreateCategoryDto
        {
            ParentCategory = parentId,
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Volantes", Slug = "volantes" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task NonExistentParentCategory_FailsValidation()
    {
        var parentId = Guid.NewGuid();
        _repoMock.Setup(r => r.ParentCategoryExists(parentId)).Returns(false);

        var dto = new CreateCategoryDto
        {
            ParentCategory = parentId,
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Volantes", Slug = "volantes" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.ParentCategory)
            .WithErrorMessage("La categoría padre debe ser vacia o existir.");
    }

    [Fact]
    public async Task NullParentCategory_PassesValidation()
    {
        var dto = new CreateCategoryDto
        {
            ParentCategory = null,
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Volantes", Slug = "volantes" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveValidationErrorFor(x => x.ParentCategory);
    }

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>()
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations)
            .WithErrorMessage("Se requiere al menos una traducción.");
    }

    [Fact]
    public async Task TranslationWithEmptyLocale_FailsValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
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
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
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
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Slug");
    }

    [Fact]
    public async Task TranslationLocaleTooLong_FailsValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es-MXX", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Locale");
    }

    [Fact]
    public async Task TranslationNameTooLong_FailsValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = new string('A', 201), Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Name");
    }

    [Fact]
    public async Task TranslationSlugTooLong_FailsValidation()
    {
        var dto = new CreateCategoryDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = new string('a', 201) }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Slug");
    }
}

public class UpdateCategoryDtoValidatorTests
{
    private readonly Mock<ICategoryAdminRepository> _repoMock;
    private readonly UpdateCategoryDtoValidator _validator;

    public UpdateCategoryDtoValidatorTests()
    {
        _repoMock = new Mock<ICategoryAdminRepository>();
        _repoMock.Setup(r => r.ParentCategoryExists(It.IsAny<Guid?>())).Returns(true);
        _validator = new UpdateCategoryDtoValidator(_repoMock.Object);
    }

    [Fact]
    public async Task ValidDto_PassesValidation()
    {
        var dto = new UpdateCategoryDto
        {
            IsActive = true
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task NonExistentParentCategory_FailsValidation()
    {
        var parentId = Guid.NewGuid();
        _repoMock.Setup(r => r.ParentCategoryExists(parentId)).Returns(false);

        var dto = new UpdateCategoryDto
        {
            ParentCategory = parentId,
            IsActive = true
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.ParentCategory)
            .WithErrorMessage("La categoría padre debe ser vacia o existir.");
    }

    [Fact]
    public async Task NullParentCategory_PassesValidation()
    {
        var dto = new UpdateCategoryDto
        {
            ParentCategory = null,
            IsActive = true
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveValidationErrorFor(x => x.ParentCategory);
    }
}

public class UpdateCategoryTranslationsDtoValidatorTests
{
    private readonly UpdateCategoryTranslationsDtoValidator _validator = new();

    [Fact]
    public async Task EmptyTranslations_FailsValidation()
    {
        var dto = new UpdateCategoryTranslationsDto { Translations = new() };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor(x => x.Translations)
            .WithErrorMessage("Se requiere al menos una traducción.");
    }

    [Fact]
    public async Task ValidTranslations_PassesValidation()
    {
        var dto = new UpdateCategoryTranslationsDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task TranslationWithInvalidFields_FailsValidation()
    {
        var dto = new UpdateCategoryTranslationsDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "", Name = "", Slug = "" }
            }
        };

        var result = await _validator.TestValidateAsync(dto, cancellationToken: TestContext.Current.CancellationToken);

        result.ShouldHaveValidationErrorFor("Translations[0].Locale");
        result.ShouldHaveValidationErrorFor("Translations[0].Name");
        result.ShouldHaveValidationErrorFor("Translations[0].Slug");
    }
}
