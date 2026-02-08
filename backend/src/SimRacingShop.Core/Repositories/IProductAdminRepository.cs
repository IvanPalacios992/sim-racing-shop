using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IProductAdminRepository
    {
        Task<Product> CreateAsync(Product product);
        Task<Product?> GetByIdAsync(Guid id);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Product product);
        Task<List<ProductImage>> AddImagesAsync(Guid productId, List<ProductImage> images);
        Task ReplaceTranslationsAsync(Guid productId, List<ProductTranslation> translations);
    }
}
