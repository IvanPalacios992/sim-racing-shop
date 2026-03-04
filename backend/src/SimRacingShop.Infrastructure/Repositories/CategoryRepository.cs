using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResultDto<CategoryListItemDto>> GetCategoriesAsync(CategoryFilterDto filter)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 50);

            var query = from c in _context.Categories
                        join t in _context.CategoriesTranslations
                            on c.Id equals t.CategoryId
                        where t.Locale == filter.Locale
                        select new { Category = c, Translation = t };

            // Filters
            if (filter.IsActive.HasValue)
                query = query.Where(x => x.Category.IsActive == filter.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var pattern = $"%{filter.Search.Trim()}%";
                query = query.Where(x => EF.Functions.ILike(x.Translation.Name, pattern));
            }

            // Sorting
            query = filter.SortBy?.ToLowerInvariant() switch
            {
                "name" => filter.SortDescending
                    ? query.OrderByDescending(x => x.Translation.Name)
                    : query.OrderBy(x => x.Translation.Name),
                "newest" => query.OrderByDescending(x => x.Category.CreatedAt),
                _ => query.OrderByDescending(x => x.Category.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new CategoryListItemDto
                {
                    Id = x.Category.Id,
                    Name = x.Translation.Name,
                    Slug = x.Translation.Slug,
                    ShortDescription = x.Translation.ShortDescription,
                    ImageUrl = x.Category.Image.ImageUrl,
                    IsActive = x.Category.IsActive
                })
                .ToListAsync();

            return new PaginatedResultDto<CategoryListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<CategoryDetailDto?> GetCategoryByIdAsync(Guid id, string locale)
        {
            return await BuildDetailQuery(locale)
                .Where(x => x.Category.Id == id)
                .Select(x => ProjectToDetail(x.Category, x.Translation))
                .FirstOrDefaultAsync();
        }

        private IQueryable<CategoryWithTranslation> BuildDetailQuery(string locale)
        {
            return from c in _context.Categories
                   join t in _context.CategoriesTranslations
                       on c.Id equals t.CategoryId
                   where t.Locale == locale
                   select new CategoryWithTranslation { Category = c, Translation = t };
        }

        private static CategoryDetailDto ProjectToDetail(
            Core.Entities.Category c,
            Core.Entities.CategoryTranslation t)
        {
            return new CategoryDetailDto
            {
                Id = c.Id,
                ParentCategory = c.ParentCategory,
                Name = t.Name,
                Slug = t.Slug,
                ShortDescription = t.ShortDescription,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                Image = c.Image != null
                    ? new CategoryImageDto
                    {
                        Id = c.Image.Id,
                        ImageUrl = c.Image.ImageUrl,
                        AltText = c.Image.AltText
                    }
                    : new CategoryImageDto()
            };
        }

        private sealed class CategoryWithTranslation
        {
            public Core.Entities.Category Category { get; set; } = null!;
            public Core.Entities.CategoryTranslation Translation { get; set; } = null!;
        }
    }
}
