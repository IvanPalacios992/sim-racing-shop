using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Infrastructure.Repositories;
using StackExchange.Redis;

namespace SimRacingShop.UnitTests.Repositories
{
    public class CartRepositoryTests
    {
        private readonly Mock<IConnectionMultiplexer> _multiplexerMock;
        private readonly Mock<IDatabase> _databaseMock;
        private readonly Mock<ILogger<CartRepository>> _loggerMock;
        private readonly CartRepository _repository;

        private const string KeyPrefix = "SimRacingShop:";

        public CartRepositoryTests()
        {
            _multiplexerMock = new Mock<IConnectionMultiplexer>();
            _databaseMock = new Mock<IDatabase>();
            _loggerMock = new Mock<ILogger<CartRepository>>();

            _multiplexerMock
                .Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object?>()))
                .Returns(_databaseMock.Object);

            _repository = new CartRepository(_multiplexerMock.Object, _loggerMock.Object);
        }

        // --- GetAllItemsAsync ---

        [Fact]
        public async Task GetAllItemsAsync_ConItemsEnHash_DevuelveMapeoProductIdCantidad()
        {
            // Arrange
            var cartKey = "cart:user:test-user";
            var productId1 = Guid.NewGuid().ToString();
            var productId2 = Guid.NewGuid().ToString();
            var entries = new HashEntry[]
            {
                new(productId1, 3),
                new(productId2, 1),
            };

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{cartKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(entries);

            // Act
            var result = await _repository.GetAllItemsAsync(cartKey);

            // Assert
            result.Should().HaveCount(2);
            result[productId1].Should().Be(3);
            result[productId2].Should().Be(1);
        }

        [Fact]
        public async Task GetAllItemsAsync_CarritoVacio_DevuelveDiccionarioVacio()
        {
            // Arrange
            var cartKey = "cart:session:empty";

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{cartKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(Array.Empty<HashEntry>());

            // Act
            var result = await _repository.GetAllItemsAsync(cartKey);

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllItemsAsync_EntradaConCantidadCero_SeOmite()
        {
            // Arrange
            var cartKey = "cart:user:test";
            var validId = Guid.NewGuid().ToString();
            var zeroId = Guid.NewGuid().ToString();
            var entries = new HashEntry[]
            {
                new(validId, 2),
                new(zeroId, 0),
            };

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{cartKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(entries);

            // Act
            var result = await _repository.GetAllItemsAsync(cartKey);

            // Assert
            result.Should().ContainKey(validId);
            result.Should().NotContainKey(zeroId);
        }

        // --- SetItemAsync ---

        [Fact]
        public async Task SetItemAsync_LlamadaCorrectamente_EjecutaHashSetYExpire()
        {
            // Arrange
            var cartKey = "cart:user:test";
            var productId = Guid.NewGuid().ToString();
            var quantity = 5;
            var ttl = TimeSpan.FromDays(30);

            _databaseMock
                .Setup(x => x.HashSetAsync(
                    It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(),
                    It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            _databaseMock
                .Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await _repository.SetItemAsync(cartKey, productId, quantity, ttl);

            // Assert
            _databaseMock.Verify(x => x.HashSetAsync(
                $"{KeyPrefix}{cartKey}",
                productId,
                quantity,
                It.IsAny<When>(),
                It.IsAny<CommandFlags>()), Times.Once);

            _databaseMock.Verify(x => x.KeyExpireAsync(
                $"{KeyPrefix}{cartKey}",
                ttl,
                It.IsAny<ExpireWhen>(),
                It.IsAny<CommandFlags>()), Times.Once);
        }

        // --- RemoveItemAsync ---

        [Fact]
        public async Task RemoveItemAsync_ProductoExistente_DevuelveTrue()
        {
            // Arrange
            var cartKey = "cart:user:test";
            var productId = Guid.NewGuid().ToString();

            _databaseMock
                .Setup(x => x.HashDeleteAsync($"{KeyPrefix}{cartKey}", (RedisValue)productId, It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await _repository.RemoveItemAsync(cartKey, productId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveItemAsync_ProductoNoExistente_DevuelveFalse()
        {
            // Arrange
            var cartKey = "cart:user:test";
            var productId = Guid.NewGuid().ToString();

            _databaseMock
                .Setup(x => x.HashDeleteAsync($"{KeyPrefix}{cartKey}", (RedisValue)productId, It.IsAny<CommandFlags>()))
                .ReturnsAsync(false);

            // Act
            var result = await _repository.RemoveItemAsync(cartKey, productId);

            // Assert
            result.Should().BeFalse();
        }

        // --- DeleteCartAsync ---

        [Fact]
        public async Task DeleteCartAsync_LlamadaCorrectamente_EliminaLaClave()
        {
            // Arrange
            var cartKey = "cart:session:test";

            _databaseMock
                .Setup(x => x.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await _repository.DeleteCartAsync(cartKey);

            // Assert
            _databaseMock.Verify(x => x.KeyDeleteAsync(
                $"{KeyPrefix}{cartKey}",
                It.IsAny<CommandFlags>()), Times.Once);
        }

        // --- MergeAsync ---

        [Fact]
        public async Task MergeAsync_SourceVacio_NoTocaElDestino()
        {
            // Arrange
            var sourceKey = "cart:session:src";
            var destKey = "cart:user:dest";

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{sourceKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(Array.Empty<HashEntry>());

            // Act
            await _repository.MergeAsync(sourceKey, destKey, TimeSpan.FromDays(30));

            // Assert – nunca debe modificar el destino si el origen está vacío
            _databaseMock.Verify(x => x.HashSetAsync(
                It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(),
                It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.Never);
        }

        [Fact]
        public async Task MergeAsync_SinConflictos_CopiaItemsYBorraSource()
        {
            // Arrange
            var sourceKey = "cart:session:src";
            var destKey = "cart:user:dest";
            var productId = Guid.NewGuid().ToString();
            var ttl = TimeSpan.FromDays(30);

            var sourceEntries = new HashEntry[] { new(productId, 2) };

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{sourceKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(sourceEntries);

            // Producto no existe en destino → devuelve RedisValue.Null
            _databaseMock
                .Setup(x => x.HashGetAsync($"{KeyPrefix}{destKey}", (RedisValue)productId, It.IsAny<CommandFlags>()))
                .ReturnsAsync(RedisValue.Null);

            _databaseMock
                .Setup(x => x.HashSetAsync(
                    It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(),
                    It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            _databaseMock
                .Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            _databaseMock
                .Setup(x => x.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await _repository.MergeAsync(sourceKey, destKey, ttl);

            // Assert – graba qty 2 (0 en dest + 2 del source) y borra source
            _databaseMock.Verify(x => x.HashSetAsync(
                $"{KeyPrefix}{destKey}", (RedisValue)productId, (RedisValue)2,
                It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.Once);

            _databaseMock.Verify(x => x.KeyDeleteAsync(
                $"{KeyPrefix}{sourceKey}", It.IsAny<CommandFlags>()), Times.Once);
        }

        [Fact]
        public async Task MergeAsync_ConConflicto_SumaCantidades()
        {
            // Arrange
            var sourceKey = "cart:session:src";
            var destKey = "cart:user:dest";
            var productId = Guid.NewGuid().ToString();
            var ttl = TimeSpan.FromDays(30);

            var sourceEntries = new HashEntry[] { new(productId, 3) };

            _databaseMock
                .Setup(x => x.HashGetAllAsync($"{KeyPrefix}{sourceKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(sourceEntries);

            // Producto YA existe en destino con qty 2
            _databaseMock
                .Setup(x => x.HashGetAsync($"{KeyPrefix}{destKey}", (RedisValue)productId, It.IsAny<CommandFlags>()))
                .ReturnsAsync((RedisValue)2);

            _databaseMock
                .Setup(x => x.HashSetAsync(
                    It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<RedisValue>(),
                    It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            _databaseMock
                .Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            _databaseMock
                .Setup(x => x.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await _repository.MergeAsync(sourceKey, destKey, ttl);

            // Assert – 2 (dest) + 3 (src) = 5
            _databaseMock.Verify(x => x.HashSetAsync(
                $"{KeyPrefix}{destKey}", (RedisValue)productId, (RedisValue)5,
                It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.Once);
        }

        // --- ExistsAsync ---

        [Fact]
        public async Task ExistsAsync_CarritoExistente_DevuelveTrue()
        {
            // Arrange
            var cartKey = "cart:user:test";

            _databaseMock
                .Setup(x => x.KeyExistsAsync($"{KeyPrefix}{cartKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await _repository.ExistsAsync(cartKey);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task ExistsAsync_CarritoNoExistente_DevuelveFalse()
        {
            // Arrange
            var cartKey = "cart:session:ghost";

            _databaseMock
                .Setup(x => x.KeyExistsAsync($"{KeyPrefix}{cartKey}", It.IsAny<CommandFlags>()))
                .ReturnsAsync(false);

            // Act
            var result = await _repository.ExistsAsync(cartKey);

            // Assert
            result.Should().BeFalse();
        }

        // --- RefreshTtlAsync ---

        [Fact]
        public async Task RefreshTtlAsync_LlamadaCorrectamente_ActualizaExpiracion()
        {
            // Arrange
            var cartKey = "cart:user:test";
            var ttl = TimeSpan.FromDays(30);

            _databaseMock
                .Setup(x => x.KeyExpireAsync(It.IsAny<RedisKey>(), It.IsAny<TimeSpan?>(), It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await _repository.RefreshTtlAsync(cartKey, ttl);

            // Assert
            _databaseMock.Verify(x => x.KeyExpireAsync(
                $"{KeyPrefix}{cartKey}", ttl, It.IsAny<ExpireWhen>(), It.IsAny<CommandFlags>()), Times.Once);
        }
    }
}
