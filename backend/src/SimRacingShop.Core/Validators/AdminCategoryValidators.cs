using FluentValidation;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Core.Validators
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator(ICategoryAdminRepository categoryAdminRepository)
        {
            RuleFor(x => x.ParentCategory)
                .MustAsync(async (parentCategory, ct) => parentCategory == null || parentCategory == Guid.Empty || await categoryAdminRepository.ParentCategoryExistsAsync(parentCategory))
                .WithMessage("La categoría padre debe ser vacia o existir.");

            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new CategoryTranslationInputDtoValidator());
        }
    }

    public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryDtoValidator(ICategoryAdminRepository categoryAdminRepository)
        {
            RuleFor(x => x.ParentCategory)
                .MustAsync(async (parentCategory, ct) => parentCategory == null || parentCategory == Guid.Empty || await categoryAdminRepository.ParentCategoryExistsAsync(parentCategory))
                .WithMessage("La categoría padre debe ser vacia o existir.");
        }
    }

    public class CategoryTranslationInputDtoValidator : AbstractValidator<CategoryTranslationInputDto>
    {
        public CategoryTranslationInputDtoValidator()
        {
            RuleFor(x => x.Locale)
                .NotEmpty()
                .MaximumLength(5);

            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Slug)
                .NotEmpty()
                .MaximumLength(200);
        }
    }

    public class UpdateCategoryTranslationsDtoValidator : AbstractValidator<UpdateCategoryTranslationsDto>
    {
        public UpdateCategoryTranslationsDtoValidator()
        {
            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new CategoryTranslationInputDtoValidator());
        }
    }
}
