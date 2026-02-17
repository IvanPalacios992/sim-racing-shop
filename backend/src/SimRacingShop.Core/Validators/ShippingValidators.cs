using FluentValidation;
using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Validators
{
    public class CalculateShippingRequestDtoValidator : AbstractValidator<CalculateShippingRequestDto>
    {
        public CalculateShippingRequestDtoValidator()
        {
            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("El código postal es obligatorio")
                .Matches(@"^\d{5}$").WithMessage("El código postal debe tener 5 dígitos");

            RuleFor(x => x.Subtotal)
                .GreaterThanOrEqualTo(0).WithMessage("El subtotal no puede ser negativo");

            RuleFor(x => x.WeightKg)
                .GreaterThanOrEqualTo(0).WithMessage("El peso no puede ser negativo")
                .LessThanOrEqualTo(1000).WithMessage("El peso máximo es 1000 kg");
        }
    }
}
