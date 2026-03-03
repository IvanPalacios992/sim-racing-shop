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

        public async Task<List<ProductImage>> GetImagesAsync(Guid productId)
        {
            return await _context.ProductImages
                .Where(i => i.ProductId == productId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();
        }

        public async Task<ProductImage> AddImageByUrlAsync(ProductImage image)
        {
            _context.ProductImages.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<ProductImage?> GetImageByIdAsync(Guid imageId)
        {
            return await _context.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId);
        }

        public async Task DeleteImageAsync(ProductImage image)
        {
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> SkuExistsAsync(string sku)
        {
            return await _context.Products.AnyAsync(p => p.Sku == sku);
        }
        public bool SkuExists(string sku)
        {
            return _context.Products.Any(p => p.Sku == sku);
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

        public async Task<List<ProductComponentOption>> GetComponentOptionsAsync(Guid productId)
        {
            return await _context.ProductComponentOptions
                .Include(pco => pco.Component)
                .Where(pco => pco.ProductId == productId)
                .OrderBy(pco => pco.OptionGroup)
                .ThenBy(pco => pco.DisplayOrder)
                .ToListAsync();
        }

        public async Task<ProductComponentOption?> GetComponentOptionByIdAsync(Guid optionId)
        {
            return await _context.ProductComponentOptions
                .Include(pco => pco.Component)
                .FirstOrDefaultAsync(pco => pco.Id == optionId);
        }

        public async Task<ProductComponentOption> AddComponentOptionAsync(ProductComponentOption option)
        {
            _context.ProductComponentOptions.Add(option);
            await _context.SaveChangesAsync();
            return option;
        }

        public async Task UpdateComponentOptionAsync(ProductComponentOption option)
        {
            _context.ProductComponentOptions.Update(option);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteComponentOptionAsync(ProductComponentOption option)
        {
            _context.ProductComponentOptions.Remove(option);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Category>> GetCategoriesAsync(Guid productId)
        {
            var product = await _context.Products
                .Include(p => p.Categories)
                    .ThenInclude(c => c.Translations)
                .FirstOrDefaultAsync(p => p.Id == productId);

            return product?.Categories.ToList() ?? new List<Category>();
        }

        public async Task SetCategoriesAsync(Guid productId, List<Guid> categoryIds)
        {
            var product = await _context.Products
                .Include(p => p.Categories)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null) return;

            product.Categories.Clear();

            if (categoryIds.Count > 0)
            {
                var categories = await _context.Categories
                    .Where(c => categoryIds.Contains(c.Id))
                    .ToListAsync();

                foreach (var cat in categories)
                    product.Categories.Add(cat);
            }

            await _context.SaveChangesAsync();
        }
    }
}
