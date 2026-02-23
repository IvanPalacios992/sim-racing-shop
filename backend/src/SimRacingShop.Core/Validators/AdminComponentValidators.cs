using FluentValidation;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Core.Validators
{
    public class CreateComponentDtoValidator : AbstractValidator<CreateComponentDto>
    {
        public CreateComponentDtoValidator(IComponentAdminRepository componentAdminRepository)
        {
            RuleFor(x => x.Sku)
                .NotEmpty()
                .MaximumLength(50)
                .Must(sku => !componentAdminRepository.SkuExists(sku))
                .WithMessage("Ya existe un componente con este SKU.");

            RuleFor(x => x.ComponentType)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("El stock no puede ser negativo.");

            RuleFor(x => x.MinStockThreshold)
                .GreaterThanOrEqualTo(0).WithMessage("El umbral mínimo de stock no puede ser negativo.");

            RuleFor(x => x.CostPrice)
                .GreaterThanOrEqualTo(0).When(x => x.CostPrice.HasValue)
                .WithMessage("El precio de coste no puede ser negativo.");

            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new ComponentTranslationInputDtoValidator());
        }
    }

    public class UpdateComponentDtoValidator : AbstractValidator<UpdateComponentDto>
    {
        public UpdateComponentDtoValidator()
        {
            RuleFor(x => x.ComponentType)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("El stock no puede ser negativo.");

            RuleFor(x => x.MinStockThreshold)
                .GreaterThanOrEqualTo(0).WithMessage("El umbral mínimo de stock no puede ser negativo.");

            RuleFor(x => x.CostPrice)
                .GreaterThanOrEqualTo(0).When(x => x.CostPrice.HasValue)
                .WithMessage("El precio de coste no puede ser negativo.");
        }
    }

    public class ComponentTranslationInputDtoValidator : AbstractValidator<ComponentTranslationInputDto>
    {
        public ComponentTranslationInputDtoValidator()
        {
            RuleFor(x => x.Locale)
                .NotEmpty()
                .MaximumLength(5);

            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(255);
        }
    }

    public class UpdateComponentTranslationsDtoValidator : AbstractValidator<UpdateComponentTranslationsDto>
    {
        public UpdateComponentTranslationsDtoValidator()
        {
            RuleFor(x => x.Translations)
                .NotEmpty().WithMessage("Se requiere al menos una traducción.");

            RuleForEach(x => x.Translations)
                .SetValidator(new ComponentTranslationInputDtoValidator());
        }
    }

    public class UpdateStockDtoValidator : AbstractValidator<UpdateStockDto>
    {
        public UpdateStockDtoValidator()
        {
            RuleFor(x => x.Quantity)
                .GreaterThanOrEqualTo(0).WithMessage("La cantidad de stock no puede ser negativa.");
        }
    }
}
