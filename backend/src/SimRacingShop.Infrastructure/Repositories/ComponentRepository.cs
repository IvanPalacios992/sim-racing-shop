using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class ComponentRepository : IComponentRepository
    {
        private readonly ApplicationDbContext _context;

        public ComponentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResultDto<ComponentListItemDto>> GetComponentsAsync(ComponentFilterDto filter)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 50);

            var query = from c in _context.Components
                        join t in _context.ComponentTranslations
                            on c.Id equals t.ComponentId
                        where t.Locale == filter.Locale
                        select new { Component = c, Translation = t };

            // Filter by component type
            if (!string.IsNullOrWhiteSpace(filter.ComponentType))
                query = query.Where(x => x.Component.ComponentType == filter.ComponentType);

            // Filter by stock availability
            if (filter.InStock.HasValue)
            {
                if (filter.InStock.Value)
                    query = query.Where(x => x.Component.StockQuantity > 0);
                else
                    query = query.Where(x => x.Component.StockQuantity <= 0);
            }

            // Full-text search
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchPattern = $"%{filter.Search}%";
                query = query.Where(x =>
                    EF.Functions.ILike(x.Component.Sku, searchPattern) ||
                    EF.Functions.ILike(x.Translation.Name, searchPattern) ||
                    (x.Translation.Description != null && EF.Functions.ILike(x.Translation.Description, searchPattern)));
            }

            // Sort by name
            query = query.OrderBy(x => x.Translation.Name);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ComponentListItemDto
                {
                    Id = x.Component.Id,
                    Sku = x.Component.Sku,
                    ComponentType = x.Component.ComponentType,
                    Name = x.Translation.Name,
                    Description = x.Translation.Description,
                    StockQuantity = x.Component.StockQuantity,
                    InStock = x.Component.StockQuantity > 0,
                    WeightGrams = x.Component.WeightGrams
                })
                .ToListAsync();

            return new PaginatedResultDto<ComponentListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<decimal> GetPriceModifiersSumAsync(Guid productId, IEnumerable<Guid> componentIds)
        {
            var ids = componentIds.ToList();
            if (ids.Count == 0) return 0m;

            return await _context.ProductComponentOptions
                .Where(pco => pco.ProductId == productId && ids.Contains(pco.ComponentId))
                .SumAsync(pco => pco.PriceModifier);
        }

        public async Task<List<ProductComponentOptionDto>> GetComponentsByProductIdAsync(Guid productId, string locale)
        {
            var query = from pco in _context.ProductComponentOptions
                        join c in _context.Components
                            on pco.ComponentId equals c.Id
                        join ct in _context.ComponentTranslations
                            on c.Id equals ct.ComponentId
                        where pco.ProductId == productId
                            && ct.Locale == locale
                        orderby pco.OptionGroup, pco.DisplayOrder
                        select new ProductComponentOptionDto
                        {
                            ComponentId = c.Id,
                            Sku = c.Sku,
                            ComponentType = c.ComponentType,
                            Name = ct.Name,
                            Description = ct.Description,
                            OptionGroup = pco.OptionGroup,
                            IsGroupRequired = pco.IsGroupRequired,
                            GlbObjectName = pco.GlbObjectName,
                            ThumbnailUrl = pco.ThumbnailUrl,
                            PriceModifier = pco.PriceModifier,
                            IsDefault = pco.IsDefault,
                            DisplayOrder = pco.DisplayOrder,
                            StockQuantity = c.StockQuantity,
                            InStock = c.StockQuantity > 0
                        };

            return await query.ToListAsync();
        }
    }
}
