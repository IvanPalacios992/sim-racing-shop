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

        // Image URL management
        Task<List<ProductImage>> GetImagesAsync(Guid productId);
        Task<ProductImage> AddImageByUrlAsync(ProductImage image);
        Task<ProductImage?> GetImageByIdAsync(Guid imageId);
        Task DeleteImageAsync(ProductImage image);
        Task ReplaceTranslationsAsync(Guid productId, List<ProductTranslation> translations);
        Task<bool> SkuExistsAsync(string sku);
        bool SkuExists(string sku);

        // ProductComponentOption management
        Task<List<ProductComponentOption>> GetComponentOptionsAsync(Guid productId);
        Task<ProductComponentOption?> GetComponentOptionByIdAsync(Guid optionId);
        Task<ProductComponentOption> AddComponentOptionAsync(ProductComponentOption option);
        Task UpdateComponentOptionAsync(ProductComponentOption option);
        Task DeleteComponentOptionAsync(ProductComponentOption option);

        // Category management
        Task<List<Category>> GetCategoriesAsync(Guid productId);
        Task SetCategoriesAsync(Guid productId, List<Guid> categoryIds);
    }
}
