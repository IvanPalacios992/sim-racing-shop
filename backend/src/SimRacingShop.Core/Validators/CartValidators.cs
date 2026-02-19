using FluentValidation;
using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Validators
{
    public class AddToCartDtoValidator : AbstractValidator<AddToCartDto>
    {
        public AddToCartDtoValidator()
        {
            RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("El id del producto es obligatorio");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0")
                .LessThanOrEqualTo(99).WithMessage("La cantidad máxima por producto es 99");
        }
    }

    public class UpdateCartItemDtoValidator : AbstractValidator<UpdateCartItemDto>
    {
        public UpdateCartItemDtoValidator()
        {
            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0")
                .LessThanOrEqualTo(99).WithMessage("La cantidad máxima por producto es 99");
        }
    }

    public class MergeCartDtoValidator : AbstractValidator<MergeCartDto>
    {
        public MergeCartDtoValidator()
        {
            RuleFor(x => x.SessionId)
                .NotEmpty().WithMessage("El sessionId del carrito anónimo es obligatorio")
                .MaximumLength(100).WithMessage("El sessionId no es válido");
        }
    }
}
