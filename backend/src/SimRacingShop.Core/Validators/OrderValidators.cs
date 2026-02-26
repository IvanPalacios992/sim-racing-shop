using FluentValidation;
using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Validators
{
    public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
    {
        public CreateOrderItemDtoValidator()
        {
            RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("El id del producto es obligatorio");

            RuleFor(x => x.ProductName)
                .NotEmpty().WithMessage("El nombre del producto es obligatorio");

            RuleFor(x => x.ProductSku)
                .NotEmpty().WithMessage("El SKU del producto es obligatorio");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a 0")
                .LessThanOrEqualTo(100).WithMessage("La cantidad máxima por producto es 100");

            RuleFor(x => x.UnitPrice)
                .GreaterThan(0).WithMessage("El precio unitario debe ser mayor a 0");

            RuleFor(x => x.UnitSubtotal)
                .GreaterThan(0).WithMessage("El precio unitario sin IVA debe ser mayor a 0");

            RuleFor(x => x.LineTotal)
                .GreaterThan(0).WithMessage("El total de línea debe ser mayor a 0");

            RuleFor(x => x.LineSubtotal)
                .GreaterThan(0).WithMessage("El total de línea sin IVA debe ser mayor a 0");

            // Validar que LineTotal = Quantity * UnitPrice
            RuleFor(x => x)
                .Must(x => Math.Abs(x.LineTotal - (x.Quantity * x.UnitPrice)) < 0.01m)
                .WithMessage("El total de línea no coincide con cantidad × precio unitario");

            // Validar que LineSubtotal = Quantity * UnitSubtotal
            RuleFor(x => x)
                .Must(x => Math.Abs(x.LineSubtotal - (x.Quantity * x.UnitSubtotal)) < 0.01m)
                .WithMessage("El total de línea sin IVA no coincide con cantidad × precio unitario sin IVA");
        }
    }

    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.ShippingStreet)
                .NotEmpty().WithMessage("La calle de envío es obligatoria");

            RuleFor(x => x.ShippingCity)
                .NotEmpty().WithMessage("La ciudad de envío es obligatoria");

            RuleFor(x => x.ShippingPostalCode)
                .NotEmpty().WithMessage("El código postal de envío es obligatorio");

            RuleFor(x => x.ShippingCountry)
                .NotEmpty().WithMessage("El país de envío es obligatorio")
                .Length(2).WithMessage("El código de país debe tener 2 caracteres (ISO)");

            RuleFor(x => x.Subtotal)
                .GreaterThan(0).WithMessage("El subtotal debe ser mayor a 0");

            RuleFor(x => x.VatAmount)
                .GreaterThanOrEqualTo(0).WithMessage("El IVA no puede ser negativo");

            RuleFor(x => x.ShippingCost)
                .GreaterThanOrEqualTo(0).WithMessage("El coste de envío no puede ser negativo");

            RuleFor(x => x.TotalAmount)
                .GreaterThan(0).WithMessage("El total debe ser mayor a 0");

            // Validar que TotalAmount = Subtotal + VatAmount + ShippingCost
            RuleFor(x => x)
                .Must(x => Math.Abs(x.TotalAmount - (x.Subtotal + x.VatAmount + x.ShippingCost)) < 0.01m)
                .WithMessage("El total no coincide con subtotal + IVA + envío");

            RuleFor(x => x.OrderItems)
                .NotEmpty().WithMessage("El pedido debe contener al menos un artículo")
                .Must(items => items.Count <= 50).WithMessage("El pedido no puede contener más de 50 artículos diferentes");

            // Validar cada item del pedido
            RuleForEach(x => x.OrderItems)
                .SetValidator(new CreateOrderItemDtoValidator());

            // Validar que el Subtotal coincida con la suma de los LineSubtotal (sin IVA)
            RuleFor(x => x)
                .Must(x => Math.Abs(x.Subtotal - x.OrderItems.Sum(i => i.LineSubtotal)) < 0.01m)
                .WithMessage("El subtotal no coincide con la suma de los artículos");
        }
    }
}
