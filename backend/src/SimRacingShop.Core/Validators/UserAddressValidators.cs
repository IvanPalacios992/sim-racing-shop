using FluentValidation;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Core.Validators
{
    public class CreateBillingAddressDtoValidator : AbstractValidator<CreateBillingAddressDto>
    {
        public CreateBillingAddressDtoValidator(IUserAddressRepository userAddressRepository)
        {
            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("La calle no debe ser vacia.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("La ciudad no debe ser vacia.");

            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("El código postal no debe ser vacio.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("El país no debe ser vacio.");

            RuleFor(x => x.UserId)
                .Must(x => !userAddressRepository.ExistBillingAddressForUser(x))
                .WithMessage("Ya existe una dirección de facturación para este usuario");

        }
    }

    public class UpdateBillingAddressDtoValidator : AbstractValidator<UpdateBillingAddressDto>
    {
        public UpdateBillingAddressDtoValidator(ICategoryAdminRepository categoryAdminRepository)
        {
            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("La calle no debe ser vacia.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("La ciudad no debe ser vacia.");

            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("El código postal no debe ser vacio.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("El país no debe ser vacio.");
        }
    }

    public class CreateDeliveryAddressDtoValidator : AbstractValidator<CreateDeliveryAddressDto>
    {
        public CreateDeliveryAddressDtoValidator(IUserAddressRepository userAddressRepository)
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("La direción debe tener un nombre.");

            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("La calle no debe ser vacia.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("La ciudad no debe ser vacia.");

            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("El código postal no debe ser vacio.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("El país no debe ser vacio.");
        }
    }

    public class UpdateDeliveryAddressDtoValidator : AbstractValidator<UpdateDeliveryAddressDto>
    {
        public UpdateDeliveryAddressDtoValidator(ICategoryAdminRepository categoryAdminRepository)
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("La direción debe tener un nombre.");

            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("La calle no debe ser vacia.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("La ciudad no debe ser vacia.");

            RuleFor(x => x.PostalCode)
                .NotEmpty().WithMessage("El código postal no debe ser vacio.");

            RuleFor(x => x.Country)
                .NotEmpty().WithMessage("El país no debe ser vacio.");
        }
    }
}
