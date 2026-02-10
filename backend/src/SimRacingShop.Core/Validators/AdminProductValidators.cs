using FluentValidation;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Core.Validators
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator(IProductAdminRepository productAdminRepository)
        {
            RuleFor(x => x.Sku)
                .NotEmpty()
                .MaximumLength(50)
                .MustAsync(async (sku, ct) => !await productAdminRepository.SkuExistsAsync(sku))
                .WithMessage("Ya existe un producto con este SKU.");

            RuleFor(x => x.BasePrice)
                .GreaterThan(0).WithMessage("El precio base debe ser mayor que 0.");

            RuleFor(x => x.VatRate)
                .InclusiveBetween(0, 100).WithMessage("El IVA debe estar entre 0 y 100.");

            RuleFor(x => x.BaseProductionDays)
                .InclusiveBetween(1, 365).WithMessage("Los días de producción deben estar entre 1 y 365.");

            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new ProductTranslationInputDtoValidator());
        }
    }

    public class UpdateProductDtoValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductDtoValidator()
        {
            RuleFor(x => x.BasePrice)
                .GreaterThan(0).WithMessage("El precio base debe ser mayor que 0.");

            RuleFor(x => x.VatRate)
                .InclusiveBetween(0, 100).WithMessage("El IVA debe estar entre 0 y 100.");

            RuleFor(x => x.BaseProductionDays)
                .InclusiveBetween(1, 365).WithMessage("Los días de producción deben estar entre 1 y 365.");
        }
    }

    public class ProductTranslationInputDtoValidator : AbstractValidator<ProductTranslationInputDto>
    {
        public ProductTranslationInputDtoValidator()
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

    public class UpdateTranslationsDtoValidator : AbstractValidator<UpdateProductTranslationsDto>
    {
        public UpdateTranslationsDtoValidator()
        {
            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new ProductTranslationInputDtoValidator());
        }
    }
}
