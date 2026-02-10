using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface ICategoryAdminRepository
    {
        Task<Category> CreateAsync(Category category);
        Task<Category?> GetByIdAsync(Guid id);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Category category);
        Task<CategoryImage> AddImageAsync(Guid categoryId, CategoryImage image);
        Task ReplaceTranslationsAsync(Guid categoryId, List<CategoryTranslation> translations);
        Task<bool> ParentCategoryExistsAsync(Guid? parentCategory);
        bool ParentCategoryExists(Guid? parentCategory);
    }
}
