using FluentValidation.TestHelper;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Validators;

namespace SimRacingShop.UnitTests.Validators
{
    public class AddToCartDtoValidatorTests
    {
        private readonly AddToCartDtoValidator _validator = new();

        [Fact]
        public void Validate_ConDatosValidos_EsValido()
        {
            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = 3 };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_ProductIdVacio_FallaValidacion()
        {
            var dto = new AddToCartDto { ProductId = Guid.Empty, Quantity = 1 };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.ProductId);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(-100)]
        public void Validate_CantidadMenorOIgualACero_FallaValidacion(int quantity)
        {
            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = quantity };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.Quantity);
        }

        [Fact]
        public void Validate_CantidadMayorA99_FallaValidacion()
        {
            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = 100 };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.Quantity);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(50)]
        [InlineData(99)]
        public void Validate_CantidadEnRangoValido_EsValido(int quantity)
        {
            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = quantity };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.Quantity);
        }
    }

    public class UpdateCartItemDtoValidatorTests
    {
        private readonly UpdateCartItemDtoValidator _validator = new();

        [Fact]
        public void Validate_ConCantidadValida_EsValido()
        {
            var dto = new UpdateCartItemDto { Quantity = 5 };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public void Validate_CantidadMenorOIgualACero_FallaValidacion(int quantity)
        {
            var dto = new UpdateCartItemDto { Quantity = quantity };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.Quantity);
        }

        [Fact]
        public void Validate_CantidadMayorA99_FallaValidacion()
        {
            var dto = new UpdateCartItemDto { Quantity = 100 };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.Quantity)
                .WithErrorMessage("La cantidad máxima por producto es 99");
        }

        [Theory]
        [InlineData(1)]
        [InlineData(99)]
        public void Validate_CantidadEnRangoValido_EsValido(int quantity)
        {
            var dto = new UpdateCartItemDto { Quantity = quantity };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }

    public class MergeCartDtoValidatorTests
    {
        private readonly MergeCartDtoValidator _validator = new();

        [Fact]
        public void Validate_ConSessionIdValido_EsValido()
        {
            var dto = new MergeCartDto { SessionId = Guid.NewGuid().ToString() };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void Validate_SessionIdVacioONulo_FallaValidacion(string? sessionId)
        {
            var dto = new MergeCartDto { SessionId = sessionId! };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.SessionId);
        }

        [Fact]
        public void Validate_SessionIdDemasiadoLargo_FallaValidacion()
        {
            var dto = new MergeCartDto { SessionId = new string('a', 101) };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.SessionId);
        }

        [Fact]
        public void Validate_SessionIdConLongitudMaxima_EsValido()
        {
            var dto = new MergeCartDto { SessionId = new string('a', 100) };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
