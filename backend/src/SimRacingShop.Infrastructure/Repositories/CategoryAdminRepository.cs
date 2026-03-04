using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class CategoryAdminRepository : ICategoryAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryAdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Category> CreateAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(p => p.Translations)
                .Include(p => p.Image)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Category category)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }

        public async Task<CategoryImage> AddImageAsync(Guid categoryId, CategoryImage image)
        {

            image.CategoryId = categoryId;

            _context.CategoriesImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<CategoryImage?> GetImageAsync(Guid categoryId)
        {
            return await _context.CategoriesImages.FirstOrDefaultAsync(i => i.CategoryId == categoryId);
        }

        public async Task<CategoryImage> SetImageByUrlAsync(CategoryImage image)
        {
            var existing = await _context.CategoriesImages
                .FirstOrDefaultAsync(i => i.CategoryId == image.CategoryId);
            if (existing != null)
                _context.CategoriesImages.Remove(existing);

            _context.CategoriesImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task DeleteImageAsync(CategoryImage image)
        {
            _context.CategoriesImages.Remove(image);
            await _context.SaveChangesAsync();
        }

        public async Task ReplaceTranslationsAsync(Guid categoryId, List<CategoryTranslation> translations)
        {
            var existing = await _context.CategoriesTranslations
                .Where(t => t.CategoryId == categoryId)
                .ToListAsync();

            _context.CategoriesTranslations.RemoveRange(existing);

            foreach (var translation in translations)
            {
                translation.CategoryId = categoryId;
            }

            _context.CategoriesTranslations.AddRange(translations);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ParentCategoryExistsAsync(Guid? parentCategory)
        {
            return await _context.Categories.AnyAsync(c => c.Id == parentCategory);
        }

        public bool ParentCategoryExists(Guid? parentCategory)
        {
            return _context.Categories.Any(c => c.Id == parentCategory);
        }
    }
}
