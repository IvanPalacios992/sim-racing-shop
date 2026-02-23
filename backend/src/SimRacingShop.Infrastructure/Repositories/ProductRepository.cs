using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResultDto<ProductListItemDto>> GetProductsAsync(ProductFilterDto filter)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 50);

            var query = from p in _context.Products
                        join t in _context.ProductTranslations
                            on p.Id equals t.ProductId
                        where t.Locale == filter.Locale
                        select new { Product = p, Translation = t };

            // Filters
            if (filter.IsActive.HasValue)
                query = query.Where(x => x.Product.IsActive == filter.IsActive.Value);

            if (filter.IsCustomizable.HasValue)
                query = query.Where(x => x.Product.IsCustomizable == filter.IsCustomizable.Value);

            if (filter.MinPrice.HasValue)
                query = query.Where(x => x.Product.BasePrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(x => x.Product.BasePrice <= filter.MaxPrice.Value);

            // Category filter
            if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
            {
                query = query.Where(x => x.Product.Categories
                    .Any(c => c.Translations
                        .Any(t => t.Locale == filter.Locale && t.Slug == filter.CategorySlug)));
            }

            // Full-text search
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchPattern = $"%{filter.Search}%";
                query = query.Where(x =>
                    EF.Functions.ILike(x.Translation.Name, searchPattern) ||
                    (x.Translation.ShortDescription != null && EF.Functions.ILike(x.Translation.ShortDescription, searchPattern)));
            }

            // Sorting
            query = filter.SortBy?.ToLowerInvariant() switch
            {
                "price" => filter.SortDescending
                    ? query.OrderByDescending(x => x.Product.BasePrice)
                    : query.OrderBy(x => x.Product.BasePrice),
                "name" => filter.SortDescending
                    ? query.OrderByDescending(x => x.Translation.Name)
                    : query.OrderBy(x => x.Translation.Name),
                "newest" => query.OrderByDescending(x => x.Product.CreatedAt),
                _ => query.OrderByDescending(x => x.Product.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ProductListItemDto
                {
                    Id = x.Product.Id,
                    Sku = x.Product.Sku,
                    Name = x.Translation.Name,
                    Slug = x.Translation.Slug,
                    ShortDescription = x.Translation.ShortDescription,
                    BasePrice = x.Product.BasePrice,
                    VatRate = x.Product.VatRate,
                    ImageUrl = x.Product.Images
                        .OrderBy(i => i.DisplayOrder)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),
                    IsActive = x.Product.IsActive,
                    IsCustomizable = x.Product.IsCustomizable
                })
                .ToListAsync();

            return new PaginatedResultDto<ProductListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id, string locale)
        {
            return await BuildDetailQuery(locale)
                .Where(x => x.Product.Id == id)
                .Select(x => ProjectToDetail(x.Product, x.Translation, locale))
                .FirstOrDefaultAsync();
        }

        public async Task<ProductDetailDto?> GetProductBySlugAsync(string slug, string locale)
        {
            return await BuildDetailQuery(locale)
                .Where(x => x.Translation.Slug == slug)
                .Select(x => ProjectToDetail(x.Product, x.Translation, locale))
                .FirstOrDefaultAsync();
        }

        private IQueryable<ProductWithTranslation> BuildDetailQuery(string locale)
        {
            return from p in _context.Products
                   join t in _context.ProductTranslations
                       on p.Id equals t.ProductId
                   where t.Locale == locale
                   select new ProductWithTranslation { Product = p, Translation = t };
        }

        private static ProductDetailDto ProjectToDetail(
            Core.Entities.Product p,
            Core.Entities.ProductTranslation t,
            string locale)
        {
            return new ProductDetailDto
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = t.Name,
                Slug = t.Slug,
                ShortDescription = t.ShortDescription,
                LongDescription = t.LongDescription,
                BasePrice = p.BasePrice,
                VatRate = p.VatRate,
                MetaTitle = t.MetaTitle,
                MetaDescription = t.MetaDescription,
                Model3dUrl = p.Model3dUrl,
                Model3dSizeKb = p.Model3dSizeKb,
                IsActive = p.IsActive,
                IsCustomizable = p.IsCustomizable,
                BaseProductionDays = p.BaseProductionDays,
                WeightGrams = p.WeightGrams,
                CreatedAt = p.CreatedAt,
                Images = p.Images
                    .OrderBy(i => i.DisplayOrder)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        ImageUrl = i.ImageUrl,
                        AltText = i.AltText,
                        DisplayOrder = i.DisplayOrder
                    })
                    .ToList(),
                Specifications = p.Specifications
                    .Where(s => s.Locale == locale)
                    .OrderBy(s => s.DisplayOrder)
                    .Select(s => new ProductSpecificationDto
                    {
                        SpecKey = s.SpecKey,
                        SpecValue = s.SpecValue,
                        DisplayOrder = s.DisplayOrder
                    })
                    .ToList()
            };
        }

        private class ProductWithTranslation
        {
            public Core.Entities.Product Product { get; set; } = null!;
            public Core.Entities.ProductTranslation Translation { get; set; } = null!;
        }
    }
}
