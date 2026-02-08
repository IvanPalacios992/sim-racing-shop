using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IComponentAdminRepository
    {
        Task<Component> CreateAsync(Component component);
        Task<Component?> GetByIdAsync(Guid id);
        Task UpdateAsync(Component component);
        Task DeleteAsync(Component component);
        Task ReplaceTranslationsAsync(Guid componentId, List<ComponentTranslation> translations);
        Task<List<Component>> GetLowStockAsync();
        Task<bool> SkuExistsAsync(string sku);
    }
}
