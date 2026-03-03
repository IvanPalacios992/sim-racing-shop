using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class CachedCategoryRepository : ICategoryRepository
    {
        private readonly ICategoryRepository _innerRepository;
        private readonly IDistributedCache _cache;
        private readonly ILogger<CachedCategoryRepository> _logger;

        private static readonly TimeSpan ListCacheDuration = TimeSpan.FromHours(1);
        private static readonly TimeSpan DetailCacheDuration = TimeSpan.FromHours(24);

        public CachedCategoryRepository(
            ICategoryRepository innerRepository,
            IDistributedCache cache,
            ILogger<CachedCategoryRepository> logger)
        {
            _innerRepository = innerRepository;
            _cache = cache;
            _logger = logger;
        }

        public async Task<PaginatedResultDto<CategoryListItemDto>> GetCategoriesAsync(CategoryFilterDto filter)
        {
            var cacheKey = BuildListCacheKey(filter);

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for category list: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<PaginatedResultDto<CategoryListItemDto>>(cachedData)!;
            }

            _logger.LogDebug("Cache miss for category list: {CacheKey}", cacheKey);
            var result = await _innerRepository.GetCategoriesAsync(filter);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ListCacheDuration
            };

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), options);

            return result;
        }

        public async Task<CategoryDetailDto?> GetCategoryByIdAsync(Guid id, string locale)
        {
            var cacheKey = $"products:detail:id:{id}:{locale}";

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (cachedData != null)
            {
                _logger.LogDebug("Cache hit for category detail: {CacheKey}", cacheKey);
                return JsonSerializer.Deserialize<CategoryDetailDto>(cachedData);
            }

            _logger.LogDebug("Cache miss for category detail: {CacheKey}", cacheKey);
            var result = await _innerRepository.GetCategoryByIdAsync(id, locale);

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

        public static string BuildListCacheKey(CategoryFilterDto filter)
        {
            return $"categories:list:{filter.Locale}:{filter.Page}:{filter.PageSize}" +
                   $":{filter.Search}:{filter.IsActive}" +
                   $":{filter.SortBy}:{filter.SortDescending}";
        }
    }
}
