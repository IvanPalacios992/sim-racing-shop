using Microsoft.Extensions.Logging;
using SimRacingShop.Core.Repositories;
using StackExchange.Redis;

namespace SimRacingShop.Infrastructure.Repositories
{
    /// <summary>
    /// Repositorio de carrito basado en Redis Hash.
    ///
    /// Estructura de claves:
    ///   SimRacingShop:cart:user:{userId}    -> Hash autenticado (TTL 30 días)
    ///   SimRacingShop:cart:session:{id}     -> Hash anónimo    (TTL 7 días)
    ///
    /// Campos del hash:
    ///   {productId (Guid string)} -> {quantity (int string)}
    /// </summary>
    public class CartRepository : ICartRepository
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<CartRepository> _logger;

        private const string KeyPrefix = "SimRacingShop:";

        public CartRepository(IConnectionMultiplexer redis, ILogger<CartRepository> logger)
        {
            _redis = redis;
            _logger = logger;
        }

        private static string Prefixed(string key) => $"{KeyPrefix}{key}";

        public async Task<Dictionary<string, int>> GetAllItemsAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            var entries = await db.HashGetAllAsync(Prefixed(cartKey));

            var result = new Dictionary<string, int>(entries.Length);
            foreach (var entry in entries)
            {
                if (int.TryParse((string?)entry.Value, out var qty) && qty > 0)
                    result[entry.Name.ToString()] = qty;
            }
            return result;
        }

        public async Task SetItemAsync(string cartKey, string productId, int quantity, TimeSpan ttl)
        {
            var db = _redis.GetDatabase();
            var prefixedKey = Prefixed(cartKey);

            await db.HashSetAsync(prefixedKey, productId, quantity);
            await db.KeyExpireAsync(prefixedKey, ttl);

            _logger.LogDebug("Cart {CartKey}: set product {ProductId} = {Quantity}", cartKey, productId, quantity);
        }

        public async Task<bool> RemoveItemAsync(string cartKey, string productId)
        {
            var db = _redis.GetDatabase();
            var removed = await db.HashDeleteAsync(Prefixed(cartKey), productId);

            _logger.LogDebug("Cart {CartKey}: removed product {ProductId} (existed: {Removed})", cartKey, productId, removed);
            return removed;
        }

        public async Task DeleteCartAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(Prefixed(cartKey));

            _logger.LogDebug("Cart {CartKey}: deleted", cartKey);
        }

        public async Task MergeAsync(string sourceKey, string destKey, TimeSpan destTtl)
        {
            var db = _redis.GetDatabase();
            var prefixedSource = Prefixed(sourceKey);
            var prefixedDest = Prefixed(destKey);

            var sourceEntries = await db.HashGetAllAsync(prefixedSource);
            if (sourceEntries.Length == 0)
            {
                _logger.LogDebug("Merge skipped: source cart {SourceKey} is empty", sourceKey);
                return;
            }

            foreach (var entry in sourceEntries)
            {
                if (!int.TryParse((string?)entry.Value, out var srcQty) || srcQty <= 0)
                    continue;

                var existingValue = await db.HashGetAsync(prefixedDest, entry.Name);
                var existingQty = int.TryParse((string?)existingValue, out var eq) ? eq : 0;
                var newQty = existingQty + srcQty;

                await db.HashSetAsync(prefixedDest, entry.Name, newQty);
            }

            await db.KeyExpireAsync(prefixedDest, destTtl);
            await db.KeyDeleteAsync(prefixedSource);

            _logger.LogInformation("Merged cart {SourceKey} into {DestKey} ({Count} items)", sourceKey, destKey, sourceEntries.Length);
        }

        public async Task RefreshTtlAsync(string cartKey, TimeSpan ttl)
        {
            var db = _redis.GetDatabase();
            await db.KeyExpireAsync(Prefixed(cartKey), ttl);
        }

        public async Task<bool> ExistsAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            return await db.KeyExistsAsync(Prefixed(cartKey));
        }

        // ── Modificadores de precio ──────────────────────────────────────────
        // Clave paralela: SimRacingShop:{cartKey}:modifiers → Hash { productId: priceModifier }

        private static string ModifiersKey(string cartKey) => $"SimRacingShop:{cartKey}:modifiers";

        public async Task SetPriceModifierAsync(string cartKey, string productId, decimal priceModifier, TimeSpan ttl)
        {
            var db = _redis.GetDatabase();
            var key = ModifiersKey(cartKey);
            await db.HashSetAsync(key, productId, priceModifier.ToString("G"));
            await db.KeyExpireAsync(key, ttl);
        }

        public async Task<Dictionary<string, decimal>> GetAllPriceModifiersAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            var entries = await db.HashGetAllAsync(ModifiersKey(cartKey));
            var result = new Dictionary<string, decimal>(entries.Length);
            foreach (var entry in entries)
            {
                if (decimal.TryParse((string?)entry.Value, out var modifier))
                    result[entry.Name.ToString()] = modifier;
            }
            return result;
        }

        public async Task RemovePriceModifierAsync(string cartKey, string productId)
        {
            var db = _redis.GetDatabase();
            await db.HashDeleteAsync(ModifiersKey(cartKey), productId);
        }

        public async Task DeletePriceModifiersAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(ModifiersKey(cartKey));
        }

        // ── Opciones seleccionadas ───────────────────────────────────────────
        // Clave paralela: SimRacingShop:{cartKey}:selectedoptions → Hash { productId: JSON }

        private static string SelectedOptionsKey(string cartKey) => $"SimRacingShop:{cartKey}:selectedoptions";

        public async Task SetSelectedOptionsAsync(string cartKey, string productId, string optionsJson, TimeSpan ttl)
        {
            var db = _redis.GetDatabase();
            var key = SelectedOptionsKey(cartKey);
            await db.HashSetAsync(key, productId, optionsJson);
            await db.KeyExpireAsync(key, ttl);
        }

        public async Task<Dictionary<string, string>> GetAllSelectedOptionsAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            var entries = await db.HashGetAllAsync(SelectedOptionsKey(cartKey));
            var result = new Dictionary<string, string>(entries.Length);
            foreach (var entry in entries)
            {
                var value = (string?)entry.Value;
                if (value != null)
                    result[entry.Name.ToString()] = value;
            }
            return result;
        }

        public async Task RemoveSelectedOptionsAsync(string cartKey, string productId)
        {
            var db = _redis.GetDatabase();
            await db.HashDeleteAsync(SelectedOptionsKey(cartKey), productId);
        }

        public async Task DeleteAllSelectedOptionsAsync(string cartKey)
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(SelectedOptionsKey(cartKey));
        }
    }
}
