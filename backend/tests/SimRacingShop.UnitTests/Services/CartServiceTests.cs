using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;
using SimRacingShop.Infrastructure.Services;

namespace SimRacingShop.UnitTests.Services
{
    public class CartServiceTests
    {
        private readonly Mock<ICartRepository> _cartRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<IComponentRepository> _componentRepositoryMock;
        private readonly Mock<ILogger<CartService>> _loggerMock;
        private readonly CartService _service;

        private static readonly TimeSpan UserCartTtl = TimeSpan.FromDays(30);
        private static readonly TimeSpan SessionCartTtl = TimeSpan.FromDays(7);

        public CartServiceTests()
        {
            _cartRepositoryMock = new Mock<ICartRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _componentRepositoryMock = new Mock<IComponentRepository>();
            _loggerMock = new Mock<ILogger<CartService>>();

            // Default: no price modifiers stored for any cart key
            _cartRepositoryMock
                .Setup(x => x.GetAllPriceModifiersAsync(It.IsAny<string>()))
                .ReturnsAsync(new Dictionary<string, decimal>());

            _service = new CartService(
                _cartRepositoryMock.Object,
                _productRepositoryMock.Object,
                _componentRepositoryMock.Object,
                _loggerMock.Object);
        }

        // --- Helpers ---

        private static ProductDetailDto CreateProduct(
            Guid? id = null,
            string sku = "TEST-001",
            string name = "Producto Test",
            decimal basePrice = 100m,
            decimal vatRate = 21m,
            bool isActive = true,
            string? imageUrl = "image.jpg")
        {
            var images = imageUrl != null
                ? new List<ProductImageDto> { new() { Id = Guid.NewGuid(), ImageUrl = imageUrl, DisplayOrder = 1 } }
                : new List<ProductImageDto>();

            return new ProductDetailDto
            {
                Id = id ?? Guid.NewGuid(),
                Sku = sku,
                Name = name,
                Slug = "producto-test",
                BasePrice = basePrice,
                VatRate = vatRate,
                IsActive = isActive,
                Images = images,
            };
        }

        // --- GetCartAsync ---

        [Fact]
        public async Task GetCartAsync_CarritoVacio_DevuelveCarritoConCeroItems()
        {
            // Arrange
            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync("cart:user:uid"))
                .ReturnsAsync(new Dictionary<string, int>());

            // Act
            var result = await _service.GetCartAsync("cart:user:uid", "es");

            // Assert
            result.Items.Should().BeEmpty();
            result.TotalItems.Should().Be(0);
            result.Subtotal.Should().Be(0);
            result.VatAmount.Should().Be(0);
            result.Total.Should().Be(0);
        }

        [Fact]
        public async Task GetCartAsync_ConItems_CalculaSubtotalesCorrectamente()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var product = CreateProduct(productId, basePrice: 200m, vatRate: 21m);

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync("cart:user:uid"))
                .ReturnsAsync(new Dictionary<string, int> { { productId.ToString(), 2 } });

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(product);

            // Act
            var result = await _service.GetCartAsync("cart:user:uid", "es");

            // Assert
            result.Items.Should().HaveCount(1);
            result.TotalItems.Should().Be(2);
            result.Subtotal.Should().Be(400m);          // 200 * 2
            result.VatAmount.Should().Be(84m);          // 400 * 0.21
            result.Total.Should().Be(484m);             // 400 + 84
        }

        [Fact]
        public async Task GetCartAsync_ProductoInactivo_SeOmiteDelCarrito()
        {
            // Arrange
            var activeId = Guid.NewGuid();
            var inactiveId = Guid.NewGuid();

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync("cart:user:uid"))
                .ReturnsAsync(new Dictionary<string, int>
                {
                    { activeId.ToString(), 1 },
                    { inactiveId.ToString(), 1 }
                });

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(activeId, "es"))
                .ReturnsAsync(CreateProduct(activeId, isActive: true));

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(inactiveId, "es"))
                .ReturnsAsync(CreateProduct(inactiveId, isActive: false));

            // Act
            var result = await _service.GetCartAsync("cart:user:uid", "es");

            // Assert
            result.Items.Should().HaveCount(1);
            result.Items[0].ProductId.Should().Be(activeId);
        }

        [Fact]
        public async Task GetCartAsync_ProductoNoEncontrado_SeOmiteDelCarrito()
        {
            // Arrange
            var existingId = Guid.NewGuid();
            var missingId = Guid.NewGuid();

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync("cart:user:uid"))
                .ReturnsAsync(new Dictionary<string, int>
                {
                    { existingId.ToString(), 1 },
                    { missingId.ToString(), 2 }
                });

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(existingId, "es"))
                .ReturnsAsync(CreateProduct(existingId));

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(missingId, "es"))
                .ReturnsAsync((ProductDetailDto?)null);

            // Act
            var result = await _service.GetCartAsync("cart:user:uid", "es");

            // Assert
            result.Items.Should().HaveCount(1);
        }

        // --- AddItemAsync ---

        [Fact]
        public async Task AddItemAsync_ProductoNuevoEnCarritoVacio_AñadeItem()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var product = CreateProduct(productId, basePrice: 150m, vatRate: 21m);
            var cartKey = "cart:user:uid";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 2 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(product);

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int>());

            _cartRepositoryMock
                .Setup(x => x.SetItemAsync(cartKey, productId.ToString(), 2, UserCartTtl))
                .Returns(Task.CompletedTask);

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(product);

            // Act
            var result = await _service.AddItemAsync(cartKey, dto, "es");

            // Assert
            result.Items.Should().HaveCount(1);
            result.Items[0].Quantity.Should().Be(2);
            result.Items[0].UnitPrice.Should().Be(150m);

            _cartRepositoryMock.Verify(x => x.SetItemAsync(cartKey, productId.ToString(), 2, UserCartTtl), Times.Once);
        }

        [Fact]
        public async Task AddItemAsync_ProductoYaEnCarrito_IncrementaCantidad()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var product = CreateProduct(productId, basePrice: 100m);
            var cartKey = "cart:user:uid";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 3 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(product);

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int> { { productId.ToString(), 2 } });

            _cartRepositoryMock
                .Setup(x => x.SetItemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<TimeSpan>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.AddItemAsync(cartKey, dto, "es");

            // Assert – 2 existentes + 3 nuevos = 5
            _cartRepositoryMock.Verify(x => x.SetItemAsync(
                cartKey, productId.ToString(), 5, UserCartTtl), Times.Once);
        }

        [Fact]
        public async Task AddItemAsync_ProductoNoExiste_LanzaInvalidOperationException()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 1 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync((ProductDetailDto?)null);

            // Act & Assert
            var act = () => _service.AddItemAsync(cartKey, dto, "es");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*no encontrado*");
        }

        [Fact]
        public async Task AddItemAsync_ProductoInactivo_LanzaInvalidOperationException()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 1 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(CreateProduct(productId, isActive: false, sku: "OLD-001"));

            // Act & Assert
            var act = () => _service.AddItemAsync(cartKey, dto, "es");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*disponible*");
        }

        [Fact]
        public async Task AddItemAsync_SuperaCantidadMaxima_LanzaInvalidOperationException()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 5 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(CreateProduct(productId));

            // Ya hay 96 en el carrito; 96 + 5 = 101 > 99
            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int> { { productId.ToString(), 96 } });

            // Act & Assert
            var act = () => _service.AddItemAsync(cartKey, dto, "es");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*99 unidades*");
        }

        [Fact]
        public async Task AddItemAsync_CarritoSesion_UsaTtlDeSieteDias()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:session:abc";
            var dto = new AddToCartDto { ProductId = productId, Quantity = 1 };

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(CreateProduct(productId));

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int>());

            _cartRepositoryMock
                .Setup(x => x.SetItemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<TimeSpan>()))
                .Returns(Task.CompletedTask);

            // Act
            await _service.AddItemAsync(cartKey, dto, "es");

            // Assert – debe usar TTL de sesión (7 días), no de usuario (30 días)
            _cartRepositoryMock.Verify(x => x.SetItemAsync(
                cartKey, productId.ToString(), 1, SessionCartTtl), Times.Once);
        }

        // --- UpdateItemAsync ---

        [Fact]
        public async Task UpdateItemAsync_ProductoEnCarrito_ActualizaCantidad()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int> { { productId.ToString(), 2 } });

            _cartRepositoryMock
                .Setup(x => x.SetItemAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<TimeSpan>()))
                .Returns(Task.CompletedTask);

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(CreateProduct(productId, basePrice: 100m));

            // Act
            var result = await _service.UpdateItemAsync(cartKey, productId, 7, "es");

            // Assert
            _cartRepositoryMock.Verify(x => x.SetItemAsync(
                cartKey, productId.ToString(), 7, UserCartTtl), Times.Once);
            result.Items[0].Quantity.Should().Be(7);
        }

        [Fact]
        public async Task UpdateItemAsync_ProductoNoEnCarrito_LanzaKeyNotFoundException()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int>());

            // Act & Assert
            var act = () => _service.UpdateItemAsync(cartKey, productId, 3, "es");
            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        // --- RemoveItemAsync ---

        [Fact]
        public async Task RemoveItemAsync_LlamadaCorrectamente_EliminaProducto()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var cartKey = "cart:user:uid";

            _cartRepositoryMock
                .Setup(x => x.RemoveItemAsync(cartKey, productId.ToString()))
                .ReturnsAsync(true);

            // Act
            await _service.RemoveItemAsync(cartKey, productId);

            // Assert
            _cartRepositoryMock.Verify(x => x.RemoveItemAsync(cartKey, productId.ToString()), Times.Once);
        }

        // --- ClearCartAsync ---

        [Fact]
        public async Task ClearCartAsync_LlamadaCorrectamente_BorraElCarrito()
        {
            // Arrange
            var cartKey = "cart:user:uid";

            _cartRepositoryMock
                .Setup(x => x.DeleteCartAsync(cartKey))
                .Returns(Task.CompletedTask);

            // Act
            await _service.ClearCartAsync(cartKey);

            // Assert
            _cartRepositoryMock.Verify(x => x.DeleteCartAsync(cartKey), Times.Once);
        }

        // --- MergeCartsAsync ---

        [Fact]
        public async Task MergeCartsAsync_FusionaCarritosYDevuelveCarritoUsuario()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            var sessionKey = "cart:session:abc";
            var userKey = $"cart:user:{userId}";

            _cartRepositoryMock
                .Setup(x => x.MergeAsync(sessionKey, userKey, UserCartTtl))
                .Returns(Task.CompletedTask);

            // Tras el merge, el repositorio devuelve el estado final del carrito de usuario
            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(userKey))
                .ReturnsAsync(new Dictionary<string, int> { { productId.ToString(), 3 } });

            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId, "es"))
                .ReturnsAsync(CreateProduct(productId, basePrice: 50m, vatRate: 21m));

            // Act
            var result = await _service.MergeCartsAsync(sessionKey, userKey, "es");

            // Assert
            _cartRepositoryMock.Verify(x => x.MergeAsync(sessionKey, userKey, UserCartTtl), Times.Once);
            result.Items.Should().HaveCount(1);
            result.TotalItems.Should().Be(3);
        }

        // --- Cálculo de totales con múltiples IVAs ---

        [Fact]
        public async Task GetCartAsync_ProductosConDistintoIva_CalculaVatPonderado()
        {
            // Arrange
            var productId1 = Guid.NewGuid();
            var productId2 = Guid.NewGuid();
            var cartKey = "cart:user:uid";

            _cartRepositoryMock
                .Setup(x => x.GetAllItemsAsync(cartKey))
                .ReturnsAsync(new Dictionary<string, int>
                {
                    { productId1.ToString(), 1 },
                    { productId2.ToString(), 1 }
                });

            // producto1: 100€ base + 21% IVA = 21€ de IVA
            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId1, "es"))
                .ReturnsAsync(CreateProduct(productId1, basePrice: 100m, vatRate: 21m));

            // producto2: 50€ base + 10% IVA = 5€ de IVA
            _productRepositoryMock
                .Setup(x => x.GetProductByIdAsync(productId2, "es"))
                .ReturnsAsync(CreateProduct(productId2, basePrice: 50m, vatRate: 10m));

            // Act
            var result = await _service.GetCartAsync(cartKey, "es");

            // Assert
            result.Subtotal.Should().Be(150m);           // 100 + 50
            result.VatAmount.Should().Be(26m);           // 21 + 5
            result.Total.Should().Be(176m);              // 150 + 26
        }
    }
}
