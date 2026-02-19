using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Services;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers
{
    public class CartControllerTests
    {
        private readonly Mock<ICartService> _cartServiceMock;
        private readonly Mock<ILogger<CartController>> _loggerMock;
        private readonly CartController _controller;

        private const string SessionHeader = "X-Cart-Session";

        public CartControllerTests()
        {
            _cartServiceMock = new Mock<ICartService>();
            _loggerMock = new Mock<ILogger<CartController>>();
            _controller = new CartController(_cartServiceMock.Object, _loggerMock.Object);
        }

        // --- Helpers ---

        private void SetAuthenticatedUser(Guid userId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            };
        }

        private void SetAnonymousUserWithSession(string sessionId)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers[SessionHeader] = sessionId;
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private void SetAnonymousUserWithoutSession()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
        }

        private static CartDto EmptyCart() => new();

        private static CartDto CartWithOneItem(Guid productId, int qty = 1) => new CartDto
        {
            Items = new List<CartItemDto>
            {
                new() { ProductId = productId, Sku = "TST-001", Name = "Test", Quantity = qty, UnitPrice = 100m, Subtotal = 100m * qty }
            }.AsReadOnly(),
            TotalItems = qty,
            Subtotal = 100m * qty,
            VatAmount = 21m * qty,
            Total = 121m * qty,
        };

        // =========================================================
        // GET /api/cart
        // =========================================================

        [Fact]
        public async Task GetCart_UsuarioAutenticado_DevuelveCarritoConClaveDeUsuario()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            _cartServiceMock
                .Setup(x => x.GetCartAsync($"cart:user:{userId}", "es"))
                .ReturnsAsync(EmptyCart());

            // Act
            var result = await _controller.GetCart();

            // Assert
            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeOfType<CartDto>();

            _cartServiceMock.Verify(x => x.GetCartAsync($"cart:user:{userId}", "es"), Times.Once);
        }

        [Fact]
        public async Task GetCart_UsuarioAnonimoConHeader_DevuelveCarritoConClaveDeSesion()
        {
            // Arrange
            var sessionId = Guid.NewGuid().ToString();
            SetAnonymousUserWithSession(sessionId);

            _cartServiceMock
                .Setup(x => x.GetCartAsync($"cart:session:{sessionId}", "es"))
                .ReturnsAsync(EmptyCart());

            // Act
            var result = await _controller.GetCart();

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            _cartServiceMock.Verify(x => x.GetCartAsync($"cart:session:{sessionId}", "es"), Times.Once);
        }

        [Fact]
        public async Task GetCart_SinAutenticacionNiHeader_DevuelveBadRequest()
        {
            // Arrange
            SetAnonymousUserWithoutSession();

            // Act
            var result = await _controller.GetCart();

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
            _cartServiceMock.Verify(x => x.GetCartAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        // =========================================================
        // POST /api/cart/items
        // =========================================================

        [Fact]
        public async Task AddItem_UsuarioAutenticado_DevuelveCarritoActualizado()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            var dto = new AddToCartDto { ProductId = productId, Quantity = 2 };
            var cart = CartWithOneItem(productId, 2);

            _cartServiceMock
                .Setup(x => x.AddItemAsync($"cart:user:{userId}", dto, "es"))
                .ReturnsAsync(cart);

            // Act
            var result = await _controller.AddItem(dto);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.Value.Should().BeOfType<CartDto>()
                .Which.TotalItems.Should().Be(2);
        }

        [Fact]
        public async Task AddItem_ProductoNoEncontrado_DevuelveNotFound()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = 1 };

            _cartServiceMock
                .Setup(x => x.AddItemAsync(It.IsAny<string>(), It.IsAny<AddToCartDto>(), It.IsAny<string>()))
                .ThrowsAsync(new InvalidOperationException("Producto no encontrado."));

            // Act
            var result = await _controller.AddItem(dto);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task AddItem_SinSesionNiAuth_DevuelveBadRequest()
        {
            // Arrange
            SetAnonymousUserWithoutSession();
            var dto = new AddToCartDto { ProductId = Guid.NewGuid(), Quantity = 1 };

            // Act
            var result = await _controller.AddItem(dto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // =========================================================
        // PUT /api/cart/items/{productId}
        // =========================================================

        [Fact]
        public async Task UpdateItem_ProductoEnCarrito_DevuelveCarritoActualizado()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            var dto = new UpdateCartItemDto { Quantity = 5 };
            var cart = CartWithOneItem(productId, 5);

            _cartServiceMock
                .Setup(x => x.UpdateItemAsync($"cart:user:{userId}", productId, 5, "es"))
                .ReturnsAsync(cart);

            // Act
            var result = await _controller.UpdateItem(productId, dto);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.Value.Should().BeOfType<CartDto>()
                .Which.TotalItems.Should().Be(5);
        }

        [Fact]
        public async Task UpdateItem_ProductoNoEstaEnCarrito_DevuelveNotFound()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            _cartServiceMock
                .Setup(x => x.UpdateItemAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>()))
                .ThrowsAsync(new KeyNotFoundException("El producto no está en el carrito."));

            // Act
            var result = await _controller.UpdateItem(Guid.NewGuid(), new UpdateCartItemDto { Quantity = 1 });

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task UpdateItem_ErrorDeNegocio_DevuelveBadRequest()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            _cartServiceMock
                .Setup(x => x.UpdateItemAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>()))
                .ThrowsAsync(new InvalidOperationException("Cantidad inválida."));

            // Act
            var result = await _controller.UpdateItem(Guid.NewGuid(), new UpdateCartItemDto { Quantity = 0 });

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateItem_SinSesionNiAuth_DevuelveBadRequest()
        {
            // Arrange
            SetAnonymousUserWithoutSession();

            // Act
            var result = await _controller.UpdateItem(Guid.NewGuid(), new UpdateCartItemDto { Quantity = 1 });

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // =========================================================
        // DELETE /api/cart/items/{productId}
        // =========================================================

        [Fact]
        public async Task RemoveItem_UsuarioAutenticado_DevuelveNoContent()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            _cartServiceMock
                .Setup(x => x.RemoveItemAsync($"cart:user:{userId}", productId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.RemoveItem(productId);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            _cartServiceMock.Verify(x => x.RemoveItemAsync($"cart:user:{userId}", productId), Times.Once);
        }

        [Fact]
        public async Task RemoveItem_UsuarioAnonimo_UsaClaveDeSession()
        {
            // Arrange
            var sessionId = "my-session";
            var productId = Guid.NewGuid();
            SetAnonymousUserWithSession(sessionId);

            _cartServiceMock
                .Setup(x => x.RemoveItemAsync($"cart:session:{sessionId}", productId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.RemoveItem(productId);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task RemoveItem_SinSesionNiAuth_DevuelveBadRequest()
        {
            // Arrange
            SetAnonymousUserWithoutSession();

            // Act
            var result = await _controller.RemoveItem(Guid.NewGuid());

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // =========================================================
        // DELETE /api/cart
        // =========================================================

        [Fact]
        public async Task ClearCart_UsuarioAutenticado_VaciaCarritoYDevuelveNoContent()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            _cartServiceMock
                .Setup(x => x.ClearCartAsync($"cart:user:{userId}"))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.ClearCart();

            // Assert
            result.Should().BeOfType<NoContentResult>();
            _cartServiceMock.Verify(x => x.ClearCartAsync($"cart:user:{userId}"), Times.Once);
        }

        [Fact]
        public async Task ClearCart_SinSesionNiAuth_DevuelveBadRequest()
        {
            // Arrange
            SetAnonymousUserWithoutSession();

            // Act
            var result = await _controller.ClearCart();

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // =========================================================
        // POST /api/cart/merge
        // =========================================================

        [Fact]
        public async Task MergeCart_UsuarioAutenticadoConSessionId_FusionaYDevuelveCarrito()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var sessionId = Guid.NewGuid().ToString();
            SetAuthenticatedUser(userId);

            var dto = new MergeCartDto { SessionId = sessionId };
            var cart = CartWithOneItem(Guid.NewGuid(), 2);

            _cartServiceMock
                .Setup(x => x.MergeCartsAsync(
                    $"cart:session:{sessionId}",
                    $"cart:user:{userId}",
                    "es"))
                .ReturnsAsync(cart);

            // Act
            var result = await _controller.MergeCart(dto);

            // Assert
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            ok.Value.Should().BeOfType<CartDto>();

            _cartServiceMock.Verify(x => x.MergeCartsAsync(
                $"cart:session:{sessionId}",
                $"cart:user:{userId}",
                "es"), Times.Once);
        }

        [Fact]
        public async Task MergeCart_LocalePersonalizado_PropagaLocaleAlServicio()
        {
            // Arrange
            var userId = Guid.NewGuid();
            SetAuthenticatedUser(userId);

            var dto = new MergeCartDto { SessionId = "session-123" };

            _cartServiceMock
                .Setup(x => x.MergeCartsAsync(It.IsAny<string>(), It.IsAny<string>(), "en"))
                .ReturnsAsync(EmptyCart());

            // Act
            await _controller.MergeCart(dto, locale: "en");

            // Assert
            _cartServiceMock.Verify(x => x.MergeCartsAsync(
                It.IsAny<string>(), It.IsAny<string>(), "en"), Times.Once);
        }
    }
}
