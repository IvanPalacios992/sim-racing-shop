using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de administración de categorias (requiere rol Admin)
    /// </summary>
    [ApiController]
    [Route("api/admin/categories")]
    [Authorize(Roles = "Admin")]
    public class AdminCategoriesController : ControllerBase
    {
        private readonly ICategoryAdminRepository _adminRepository;
        private readonly IFileStorageService _fileStorage;
        private readonly IDistributedCache _cache;
        private readonly ILogger<AdminCategoriesController> _logger;

        public AdminCategoriesController(
            ICategoryAdminRepository adminRepository,
            IFileStorageService fileStorage,
            IDistributedCache cache,
            ILogger<AdminCategoriesController> logger)
        {
            _adminRepository = adminRepository;
            _fileStorage = fileStorage;
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Crear una nuevo categoria con traducciones
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CategoryDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            _logger.LogInformation("Creating catgory");

            var category = new Category
            {
                Id = Guid.NewGuid(),
                ParentCategory = dto.ParentCategory,
                Translations = dto.Translations.Select(t => new CategoryTranslation
                {
                    Id = Guid.NewGuid(),
                    Locale = t.Locale,
                    Name = t.Name,
                    Slug = t.Slug,
                    ShortDescription = t.ShortDescription,
                }).ToList()
            };

            await _adminRepository.CreateAsync(category);
            await InvalidateCategoryCacheAsync(category);

            _logger.LogInformation("Category created: {CategoryId}", category.Id);

            var result = MapToDetailDto(category, category.Translations.First().Locale);
            return CreatedAtAction(
                actionName: "GetCategoryById",
                controllerName: "Categories",
                routeValues: new { id = category.Id },
                value: result);
        }

        /// <summary>
        /// Editar campos base de una categoria
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            _logger.LogInformation("Updating category: {CategoryId}", id);

            var category = await _adminRepository.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Category not found for update: {CategoryId}", id);
                return NotFound(new { message = "Categoria no encontrada" });
            }

            category.ParentCategory =dto.ParentCategory;
            category.IsActive = dto.IsActive;

            await _adminRepository.UpdateAsync(category);
            await InvalidateCategoryCacheAsync(category);

            _logger.LogInformation("Category updated: {CategoryId}", id);

            var result = MapToDetailDto(category, category.Translations.FirstOrDefault()?.Locale ?? "es");
            return Ok(result);
        }

        /// <summary>
        /// Eliminar una categoria y todas sus relaciones
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            _logger.LogInformation("Deleting category: {CategoryId}", id);

            var category = await _adminRepository.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Category not found for deletion: {CategoryId}", id);
                return NotFound(new { message = "Categoria no encontrada" });
            }

            // Delete associated image files
            await _fileStorage.DeleteFileAsync(category.Image.ImageUrl);

            await _adminRepository.DeleteAsync(category);
            await InvalidateCategoryCacheAsync(category);

            _logger.LogInformation("Category deleted: {CategoryId}", id);
            return NoContent();
        }

        /// <summary>
        /// Subir imágenes para una categoria
        /// </summary>
        [HttpPost("{id:guid}/images")]
        [ProducesResponseType(typeof(CategoryImageUploadResultDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UploadImages(Guid id, [FromForm] IFormFile file)
        {
            _logger.LogInformation("Uploading image for category: {CategoryId}", id);

            if (file == null)
            {
                return BadRequest(new { message = "No se proporcionaron archivos" });
            }

            var category = await _adminRepository.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Category not found for image upload: {CategoryId}", id);
                return NotFound(new { message = "Categoria no encontrada" });
            }
            CategoryImage image;
            try
            {
                using var stream = file.OpenReadStream();
                var imageUrl = await _fileStorage.SaveFileAsync(stream, file.FileName, "categories");

                image = new CategoryImage
                {
                    Id = Guid.NewGuid(),
                    ImageUrl = imageUrl,
                    AltText = Path.GetFileNameWithoutExtension(file.FileName),
                };
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            var savedImages = await _adminRepository.AddImageAsync(id, image);
            await InvalidateCategoryCacheAsync(category);

            _logger.LogInformation("Uploaded image for category: {CategoryId}", id);

            var result = new CategoryImageUploadResultDto
            {
                Id = image.Id,
                ImageUrl = image.ImageUrl,
                AltText = image.AltText
            };

            return Created($"/api/admin/categories/{id}/images", result);
        }

        /// <summary>
        /// Reemplazar todas las traducciones de una categoria
        /// </summary>
        [HttpPut("{id:guid}/translations")]
        [ProducesResponseType(typeof(CategoryDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTranslations(Guid id, [FromBody] UpdateCategoryTranslationsDto dto)
        {
            _logger.LogInformation("Updating translations for category: {CategoryId}", id);

            var category = await _adminRepository.GetByIdAsync(id);
            if (category == null)
            {
                _logger.LogWarning("Category not found for translation update: {CategoryId}", id);
                return NotFound(new { message = "Categoria no encontrada" });
            }

            var translations = dto.Translations.Select(t => new CategoryTranslation
            {
                Id = Guid.NewGuid(),
                Locale = t.Locale,
                Name = t.Name,
                Slug = t.Slug,
                ShortDescription = t.ShortDescription,
            }).ToList();

            await _adminRepository.ReplaceTranslationsAsync(id, translations);
            await InvalidateCategoryCacheAsync(category);

            // Reload category with new translations
            category = await _adminRepository.GetByIdAsync(id);

            _logger.LogInformation("Translations updated for productcategory: {CategoryId}", id);

            var result = MapToDetailDto(category!, category!.Translations.FirstOrDefault()?.Locale ?? "es");
            return Ok(result);
        }

        private async Task InvalidateCategoryCacheAsync(Category category)
        {
            // Invalidate detail cache by ID for each locale
            foreach (var translation in category.Translations)
            {
                var idKey = $"categories:detail:id:{category.Id}:{translation.Locale}";
                var slugKey = $"categories:detail:slug:{translation.Slug}:{translation.Locale}";

                await _cache.RemoveAsync(idKey);
                await _cache.RemoveAsync(slugKey);
            }

            // List caches expire naturally by TTL (1 hour)
        }

        private static CategoryDetailDto MapToDetailDto(Category category, string locale)
        {
            var translation = category.Translations.FirstOrDefault(t => t.Locale == locale)
                              ?? category.Translations.First();

            return new CategoryDetailDto
            {
                Id = category.Id,
                Name = translation.Name,
                Slug = translation.Slug,
                ShortDescription = translation.ShortDescription,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                Image = category.Image != null
                    ? new CategoryImageDto { Id = category.Image.Id, ImageUrl = category.Image.ImageUrl, AltText = category.Image.AltText }
                    : new CategoryImageDto()
            };
        }
    }
}
