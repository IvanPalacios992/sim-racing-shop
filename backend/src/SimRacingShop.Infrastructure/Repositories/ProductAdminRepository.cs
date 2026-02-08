using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class ProductAdminRepository : IProductAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductAdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _context.Products
                .Include(p => p.Translations)
                .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
                .Include(p => p.Specifications)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Product product)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ProductImage>> AddImagesAsync(Guid productId, List<ProductImage> images)
        {
            foreach (var image in images)
            {
                image.ProductId = productId;
            }

            _context.ProductImages.AddRange(images);
            await _context.SaveChangesAsync();
            return images;
        }

        public async Task ReplaceTranslationsAsync(Guid productId, List<ProductTranslation> translations)
        {
            var existing = await _context.ProductTranslations
                .Where(t => t.ProductId == productId)
                .ToListAsync();

            _context.ProductTranslations.RemoveRange(existing);

            foreach (var translation in translations)
            {
                translation.ProductId = productId;
            }

            _context.ProductTranslations.AddRange(translations);
            await _context.SaveChangesAsync();
        }
    }
}
