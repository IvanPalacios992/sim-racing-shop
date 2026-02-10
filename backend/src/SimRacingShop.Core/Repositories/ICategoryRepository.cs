using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Repositories
{
    public interface ICategoryRepository
    {
        Task<PaginatedResultDto<CategoryListItemDto>> GetCategoriesAsync(CategoryFilterDto filter);
        Task<CategoryDetailDto?> GetCategoryByIdAsync(Guid id, string locale);
    }
}
