using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Repositories
{
    public interface IProductRepository
    {
        Task<PaginatedResultDto<ProductListItemDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDetailDto?> GetProductByIdAsync(Guid id, string locale);
        Task<ProductDetailDto?> GetProductBySlugAsync(string slug, string locale);
    }
}
