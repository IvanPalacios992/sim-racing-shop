using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;
using StackExchange.Redis;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de administración de productos (requiere rol Admin)
    /// </summary>
    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "Admin")]
    public class AdminProductsController : ControllerBase
    {
        private readonly IProductAdminRepository _adminRepository;
        private readonly IComponentAdminRepository _componentAdminRepository;
        private readonly IFileStorageService _fileStorage;
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer _multiplexer;
        private readonly ILogger<AdminProductsController> _logger;

        public AdminProductsController(
            IProductAdminRepository adminRepository,
            IComponentAdminRepository componentAdminRepository,
            IFileStorageService fileStorage,
            IDistributedCache cache,
            IConnectionMultiplexer multiplexer,
            ILogger<AdminProductsController> logger)
        {
            _adminRepository = adminRepository;
            _componentAdminRepository = componentAdminRepository;
            _fileStorage = fileStorage;
            _cache = cache;
            _multiplexer = multiplexer;
            _logger = logger;
        }

        /// <summary>
        /// Crear un nuevo producto con traducciones
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            _logger.LogInformation("Creating product with SKU: {Sku}", dto.Sku);

            var product = new Product
            {
                Id = Guid.NewGuid(),
                Sku = dto.Sku,
                BasePrice = dto.BasePrice,
                VatRate = dto.VatRate,
                Model3dUrl = dto.Model3dUrl,
                Model3dSizeKb = dto.Model3dSizeKb,
                IsActive = dto.IsActive,
                IsCustomizable = dto.IsCustomizable,
                BaseProductionDays = dto.BaseProductionDays,
                WeightGrams = dto.WeightGrams,
                Translations = dto.Translations.Select(t => new ProductTranslation
                {
                    Id = Guid.NewGuid(),
                    Locale = t.Locale,
                    Name = t.Name,
                    Slug = t.Slug,
                    ShortDescription = t.ShortDescription,
                    LongDescription = t.LongDescription,
                    MetaTitle = t.MetaTitle,
                    MetaDescription = t.MetaDescription
                }).ToList()
            };

            await _adminRepository.CreateAsync(product);
            await InvalidateProductCacheAsync(product);

            _logger.LogInformation("Product created: {ProductId}, SKU: {Sku}", product.Id, product.Sku);

            var result = MapToDetailDto(product, product.Translations.First().Locale);
            return CreatedAtAction(
                actionName: "GetProductById",
                controllerName: "Products",
                routeValues: new { id = product.Id },
                value: result);
        }

        /// <summary>
        /// Editar campos base de un producto
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
        {
            _logger.LogInformation("Updating product: {ProductId}", id);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product not found for update: {ProductId}", id);
                return NotFound(new { message = "Producto no encontrado" });
            }

            product.BasePrice = dto.BasePrice;
            product.VatRate = dto.VatRate;
            product.Model3dUrl = dto.Model3dUrl;
            product.Model3dSizeKb = dto.Model3dSizeKb;
            product.IsActive = dto.IsActive;
            product.IsCustomizable = dto.IsCustomizable;
            product.BaseProductionDays = dto.BaseProductionDays;
            product.WeightGrams = dto.WeightGrams;

            await _adminRepository.UpdateAsync(product);
            await InvalidateProductCacheAsync(product);

            _logger.LogInformation("Product updated: {ProductId}", id);

            var result = MapToDetailDto(product, product.Translations.FirstOrDefault()?.Locale ?? "es");
            return Ok(result);
        }

        /// <summary>
        /// Eliminar un producto y todas sus relaciones
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            _logger.LogInformation("Deleting product: {ProductId}", id);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product not found for deletion: {ProductId}", id);
                return NotFound(new { message = "Producto no encontrado" });
            }

            // Delete associated image files
            foreach (var image in product.Images)
            {
                await _fileStorage.DeleteFileAsync(image.ImageUrl);
            }

            await _adminRepository.DeleteAsync(product);
            await InvalidateProductCacheAsync(product);

            _logger.LogInformation("Product deleted: {ProductId}", id);
            return NoContent();
        }

        /// <summary>
        /// Subir imágenes para un producto
        /// </summary>
        [HttpPost("{id:guid}/images")]
        [ProducesResponseType(typeof(List<ProductImageUploadResultDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UploadImages(Guid id, [FromForm] List<IFormFile> files)
        {
            _logger.LogInformation("Uploading {Count} images for product: {ProductId}", files.Count, id);

            if (files.Count == 0)
            {
                return BadRequest(new { message = "No se proporcionaron archivos" });
            }

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product not found for image upload: {ProductId}", id);
                return NotFound(new { message = "Producto no encontrado" });
            }

            var currentMaxOrder = product.Images.Any()
                ? product.Images.Max(i => i.DisplayOrder)
                : 0;

            var images = new List<ProductImage>();

            foreach (var file in files)
            {
                try
                {
                    using var stream = file.OpenReadStream();
                    var imageUrl = await _fileStorage.SaveFileAsync(stream, file.FileName, "products");

                    currentMaxOrder++;
                    images.Add(new ProductImage
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = imageUrl,
                        AltText = Path.GetFileNameWithoutExtension(file.FileName),
                        DisplayOrder = currentMaxOrder
                    });
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
            }

            var savedImages = await _adminRepository.AddImagesAsync(id, images);
            await InvalidateProductCacheAsync(product);

            _logger.LogInformation("Uploaded {Count} images for product: {ProductId}", savedImages.Count, id);

            var result = savedImages.Select(i => new ProductImageUploadResultDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                AltText = i.AltText,
                DisplayOrder = i.DisplayOrder
            }).ToList();

            return Created($"/api/admin/products/{id}/images", result);
        }

        /// <summary>
        /// Reemplazar todas las traducciones de un producto
        /// </summary>
        [HttpPut("{id:guid}/translations")]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTranslations(Guid id, [FromBody] UpdateProductTranslationsDto dto)
        {
            _logger.LogInformation("Updating translations for product: {ProductId}", id);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product not found for translation update: {ProductId}", id);
                return NotFound(new { message = "Producto no encontrado" });
            }

            var translations = dto.Translations.Select(t => new ProductTranslation
            {
                Id = Guid.NewGuid(),
                Locale = t.Locale,
                Name = t.Name,
                Slug = t.Slug,
                ShortDescription = t.ShortDescription,
                LongDescription = t.LongDescription,
                MetaTitle = t.MetaTitle,
                MetaDescription = t.MetaDescription
            }).ToList();

            await _adminRepository.ReplaceTranslationsAsync(id, translations);
            await InvalidateProductCacheAsync(product);

            // Reload product with new translations
            product = await _adminRepository.GetByIdAsync(id);

            _logger.LogInformation("Translations updated for product: {ProductId}", id);

            var result = MapToDetailDto(product!, product!.Translations.FirstOrDefault()?.Locale ?? "es");
            return Ok(result);
        }

        // ── ProductComponentOption endpoints ──────────────────────────────────

        /// <summary>
        /// Listar todas las vinculaciones componente-producto
        /// </summary>
        [HttpGet("{id:guid}/component-options")]
        [ProducesResponseType(typeof(List<ProductComponentOptionAdminDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetComponentOptions(Guid id)
        {
            _logger.LogInformation("Getting component options for product: {ProductId}", id);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            var options = await _adminRepository.GetComponentOptionsAsync(id);
            var result = options.Select(o => MapToComponentOptionDto(o)).ToList();
            return Ok(result);
        }

        /// <summary>
        /// Vincular un componente a un producto
        /// </summary>
        [HttpPost("{id:guid}/component-options")]
        [ProducesResponseType(typeof(ProductComponentOptionAdminDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddComponentOption(Guid id, [FromBody] UpsertProductComponentOptionDto dto)
        {
            _logger.LogInformation(
                "Adding component option to product: {ProductId}, component: {ComponentId}, group: {Group}",
                id, dto.ComponentId, dto.OptionGroup);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            var component = await _componentAdminRepository.GetByIdAsync(dto.ComponentId);
            if (component == null)
                return BadRequest(new { message = "Componente no encontrado" });

            var option = new ProductComponentOption
            {
                Id = Guid.NewGuid(),
                ProductId = id,
                ComponentId = dto.ComponentId,
                OptionGroup = dto.OptionGroup,
                IsGroupRequired = dto.IsGroupRequired,
                GlbObjectName = dto.GlbObjectName,
                ThumbnailUrl = dto.ThumbnailUrl,
                PriceModifier = dto.PriceModifier,
                IsDefault = dto.IsDefault,
                DisplayOrder = dto.DisplayOrder,
            };

            await _adminRepository.AddComponentOptionAsync(option);

            _logger.LogInformation(
                "Component option created: {OptionId} (product {ProductId}, component {ComponentId})",
                option.Id, id, dto.ComponentId);

            return Created(
                $"/api/admin/products/{id}/component-options/{option.Id}",
                MapToComponentOptionDto(option, component.Sku));
        }

        /// <summary>
        /// Actualizar los parámetros de una vinculación componente-producto
        /// </summary>
        [HttpPut("{id:guid}/component-options/{optionId:guid}")]
        [ProducesResponseType(typeof(ProductComponentOptionAdminDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateComponentOption(Guid id, Guid optionId, [FromBody] UpsertProductComponentOptionDto dto)
        {
            _logger.LogInformation("Updating component option: {OptionId} on product: {ProductId}", optionId, id);

            var option = await _adminRepository.GetComponentOptionByIdAsync(optionId);
            if (option == null || option.ProductId != id)
                return NotFound(new { message = "Opción de componente no encontrada" });

            var component = await _componentAdminRepository.GetByIdAsync(dto.ComponentId);
            if (component == null)
                return BadRequest(new { message = "Componente no encontrado" });

            option.ComponentId = dto.ComponentId;
            option.OptionGroup = dto.OptionGroup;
            option.IsGroupRequired = dto.IsGroupRequired;
            option.GlbObjectName = dto.GlbObjectName;
            option.ThumbnailUrl = dto.ThumbnailUrl;
            option.PriceModifier = dto.PriceModifier;
            option.IsDefault = dto.IsDefault;
            option.DisplayOrder = dto.DisplayOrder;

            await _adminRepository.UpdateComponentOptionAsync(option);

            _logger.LogInformation("Component option updated: {OptionId}", optionId);

            return Ok(MapToComponentOptionDto(option, component.Sku));
        }

        // ── Category endpoints ────────────────────────────────────────────────

        /// <summary>
        /// Listar categorías asignadas a un producto
        /// </summary>
        [HttpGet("{id:guid}/categories")]
        [ProducesResponseType(typeof(List<ProductCategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductCategories(Guid id)
        {
            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            var categories = await _adminRepository.GetCategoriesAsync(id);
            var result = categories.Select(c => MapToCategoryDto(c)).ToList();
            return Ok(result);
        }

        /// <summary>
        /// Reemplazar las categorías de un producto (enviar lista completa de IDs)
        /// </summary>
        [HttpPut("{id:guid}/categories")]
        [ProducesResponseType(typeof(List<ProductCategoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetProductCategories(Guid id, [FromBody] SetProductCategoriesDto dto)
        {
            _logger.LogInformation("Setting categories for product: {ProductId}", id);

            var product = await _adminRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Producto no encontrado" });

            await _adminRepository.SetCategoriesAsync(id, dto.CategoryIds);

            var categories = await _adminRepository.GetCategoriesAsync(id);
            var result = categories.Select(c => MapToCategoryDto(c)).ToList();

            _logger.LogInformation("Categories updated for product: {ProductId}, count: {Count}", id, result.Count);
            return Ok(result);
        }

        /// <summary>
        /// Desvincular un componente de un producto
        /// </summary>
        [HttpDelete("{id:guid}/component-options/{optionId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteComponentOption(Guid id, Guid optionId)
        {
            _logger.LogInformation("Deleting component option: {OptionId} from product: {ProductId}", optionId, id);

            var option = await _adminRepository.GetComponentOptionByIdAsync(optionId);
            if (option == null || option.ProductId != id)
                return NotFound(new { message = "Opción de componente no encontrada" });

            await _adminRepository.DeleteComponentOptionAsync(option);

            _logger.LogInformation("Component option deleted: {OptionId}", optionId);

            return NoContent();
        }

        private async Task InvalidateProductCacheAsync(Product product)
        {
            // Invalidate detail cache by ID and slug for each locale
            foreach (var translation in product.Translations)
            {
                var idKey = $"products:detail:id:{product.Id}:{translation.Locale}";
                var slugKey = $"products:detail:slug:{translation.Slug}:{translation.Locale}";

                await _cache.RemoveAsync(idKey);
                await _cache.RemoveAsync(slugKey);
            }

            // Invalidate all list caches (keys are prefixed by InstanceName "SimRacingShop:")
            try
            {
                var server = _multiplexer.GetServer(_multiplexer.GetEndPoints().First());
                var listKeys = server.Keys(pattern: "SimRacingShop:products:list:*").ToArray();
                if (listKeys.Length > 0)
                {
                    var db = _multiplexer.GetDatabase();
                    await db.KeyDeleteAsync(listKeys);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not invalidate product list cache");
            }
        }

        private static ProductCategoryDto MapToCategoryDto(Category category)
        {
            var translation = category.Translations.FirstOrDefault(t => t.Locale == "es")
                              ?? category.Translations.FirstOrDefault();
            return new ProductCategoryDto
            {
                Id = category.Id,
                Name = translation?.Name ?? string.Empty,
                Slug = translation?.Slug ?? string.Empty,
            };
        }

        private static ProductComponentOptionAdminDto MapToComponentOptionDto(
            ProductComponentOption option, string? componentSku = null)
        {
            return new ProductComponentOptionAdminDto
            {
                Id = option.Id,
                ProductId = option.ProductId,
                ComponentId = option.ComponentId,
                ComponentSku = componentSku ?? option.Component?.Sku ?? string.Empty,
                OptionGroup = option.OptionGroup,
                IsGroupRequired = option.IsGroupRequired,
                GlbObjectName = option.GlbObjectName,
                ThumbnailUrl = option.ThumbnailUrl,
                PriceModifier = option.PriceModifier,
                IsDefault = option.IsDefault,
                DisplayOrder = option.DisplayOrder,
            };
        }

        private static ProductDetailDto MapToDetailDto(Product product, string locale)
        {
            var translation = product.Translations.FirstOrDefault(t => t.Locale == locale)
                              ?? product.Translations.First();

            return new ProductDetailDto
            {
                Id = product.Id,
                Sku = product.Sku,
                Name = translation.Name,
                Slug = translation.Slug,
                ShortDescription = translation.ShortDescription,
                LongDescription = translation.LongDescription,
                BasePrice = product.BasePrice,
                VatRate = product.VatRate,
                MetaTitle = translation.MetaTitle,
                MetaDescription = translation.MetaDescription,
                Model3dUrl = product.Model3dUrl,
                Model3dSizeKb = product.Model3dSizeKb,
                IsActive = product.IsActive,
                IsCustomizable = product.IsCustomizable,
                BaseProductionDays = product.BaseProductionDays,
                WeightGrams = product.WeightGrams,
                CreatedAt = product.CreatedAt,
                Images = product.Images
                    .OrderBy(i => i.DisplayOrder)
                    .Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        ImageUrl = i.ImageUrl,
                        AltText = i.AltText,
                        DisplayOrder = i.DisplayOrder
                    }).ToList(),
                Specifications = product.Specifications
                    .Where(s => s.Locale == locale)
                    .OrderBy(s => s.DisplayOrder)
                    .Select(s => new ProductSpecificationDto
                    {
                        SpecKey = s.SpecKey,
                        SpecValue = s.SpecValue,
                        DisplayOrder = s.DisplayOrder
                    }).ToList()
            };
        }
    }
}
