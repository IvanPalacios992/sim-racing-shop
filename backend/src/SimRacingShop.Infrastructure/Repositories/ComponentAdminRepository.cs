using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class ComponentAdminRepository : IComponentAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public ComponentAdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Component> CreateAsync(Component component)
        {
            _context.Components.Add(component);
            await _context.SaveChangesAsync();
            return component;
        }

        public async Task<Component?> GetByIdAsync(Guid id)
        {
            return await _context.Components
                .Include(c => c.Translations)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task UpdateAsync(Component component)
        {
            _context.Components.Update(component);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Component component)
        {
            _context.Components.Remove(component);
            await _context.SaveChangesAsync();
        }

        public async Task ReplaceTranslationsAsync(Guid componentId, List<ComponentTranslation> translations)
        {
            var existing = await _context.ComponentTranslations
                .Where(t => t.ComponentId == componentId)
                .ToListAsync();

            _context.ComponentTranslations.RemoveRange(existing);

            foreach (var translation in translations)
            {
                translation.ComponentId = componentId;
            }

            _context.ComponentTranslations.AddRange(translations);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> SkuExistsAsync(string sku)
        {
            return await _context.Components.AnyAsync(c => c.Sku == sku);
        }

        public bool SkuExists(string sku)
        {
            return _context.Components.Any(c => c.Sku == sku);
        }

        public async Task<List<Component>> GetLowStockAsync()
        {
            return await _context.Components
                .Include(c => c.Translations)
                .Where(c => c.StockQuantity <= c.MinStockThreshold)
                .OrderBy(c => c.StockQuantity)
                .ToListAsync();
        }
    }
}
