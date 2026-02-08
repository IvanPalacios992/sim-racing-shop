using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class CachedProductRepository : IProductRepository
    {
        private readonly IProductRepository _innerRepository;
        private readonly IDistributedCache _cache;
        private readonly ILogger<CachedProductRepository> _logger;

        private static readonly TimeSpan ListCacheDuration = TimeSpan.FromHours(1);
        private static readonly TimeSpan DetailCacheDuration = TimeSpan.FromHours(24);

        public CachedProductRepository(
            IProductRepository innerRepository,
            IDistributedCache cache,
            ILogger<CachedProductRepository> logger)
        {
            _innerRepository = innerRepository;
            _cache = cache;
            _logger = logger;
        }

        public async Task<PaginatedResultDto<ProductListItemDto>> GetProductsAsync(ProductFilterDto filter)
        {
            var cacheKey = BuildListCacheKey(filter);

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for product list: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<PaginatedResultDto<ProductListItemDto>>(cachedData)!;
            }

            _logger.LogDebug("Cache miss for product list: {CacheKey}", cacheKey);
            var result = await _innerRepository.GetProductsAsync(filter);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ListCacheDuration
            };

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), options);

            return result;
        }

        public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id, string locale)
        {
            var cacheKey = $"products:detail:id:{id}:{locale}";

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for product detail: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<ProductDetailDto>(cachedData);
            }

            _logger.LogDebug("Cache miss for product detail: {CacheKey}", cacheKey);
            var result = await _innerRepository.GetProductByIdAsync(id, locale);

            if (result != null)
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = DetailCacheDuration
                };

                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), options);
            }

            return result;
        }

        public async Task<ProductDetailDto?> GetProductBySlugAsync(string slug, string locale)
        {
            var cacheKey = $"products:detail:slug:{slug}:{locale}";

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for product detail: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<ProductDetailDto>(cachedData);
            }

            _logger.LogDebug("Cache miss for product detail: {CacheKey}", cacheKey);
            var result = await _innerRepository.GetProductBySlugAsync(slug, locale);

            if (result != null)
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = DetailCacheDuration
                };

                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), options);
            }

            return result;
        }

        public static string BuildListCacheKey(ProductFilterDto filter)
        {
            return $"products:list:{filter.Locale}:{filter.Page}:{filter.PageSize}" +
                   $":{filter.Search}:{filter.MinPrice}:{filter.MaxPrice}" +
                   $":{filter.IsActive}:{filter.IsCustomizable}" +
                   $":{filter.SortBy}:{filter.SortDescending}";
        }
    }
}
