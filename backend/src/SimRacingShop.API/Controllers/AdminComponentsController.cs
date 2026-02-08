using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de administración de componentes (requiere rol Admin)
    /// </summary>
    [ApiController]
    [Route("api/admin/components")]
    [Authorize(Roles = "Admin")]
    public class AdminComponentsController : ControllerBase
    {
        private readonly IComponentAdminRepository _adminRepository;
        private readonly ILogger<AdminComponentsController> _logger;

        public AdminComponentsController(
            IComponentAdminRepository adminRepository,
            ILogger<AdminComponentsController> logger)
        {
            _adminRepository = adminRepository;
            _logger = logger;
        }

        /// <summary>
        /// Crear un nuevo componente con traducciones
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ComponentDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateComponent([FromBody] CreateComponentDto dto)
        {
            _logger.LogInformation("Creating component with SKU: {Sku}, Type: {ComponentType}", dto.Sku, dto.ComponentType);

            var component = new Component
            {
                Id = Guid.NewGuid(),
                Sku = dto.Sku,
                ComponentType = dto.ComponentType,
                StockQuantity = dto.StockQuantity,
                MinStockThreshold = dto.MinStockThreshold,
                LeadTimeDays = dto.LeadTimeDays,
                WeightGrams = dto.WeightGrams,
                CostPrice = dto.CostPrice,
                Translations = dto.Translations.Select(t => new ComponentTranslation
                {
                    Id = Guid.NewGuid(),
                    Locale = t.Locale,
                    Name = t.Name,
                    Description = t.Description
                }).ToList()
            };

            await _adminRepository.CreateAsync(component);

            _logger.LogInformation("Component created: {ComponentId}, SKU: {Sku}", component.Id, component.Sku);

            var result = MapToDetailDto(component);
            return CreatedAtAction(
                actionName: "GetComponents",
                controllerName: "Components",
                routeValues: null,
                value: result);
        }

        /// <summary>
        /// Editar campos base de un componente
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ComponentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateComponent(Guid id, [FromBody] UpdateComponentDto dto)
        {
            _logger.LogInformation("Updating component: {ComponentId}", id);

            var component = await _adminRepository.GetByIdAsync(id);
            if (component == null)
            {
                _logger.LogWarning("Component not found for update: {ComponentId}", id);
                return NotFound(new { message = "Componente no encontrado" });
            }

            component.ComponentType = dto.ComponentType;
            component.StockQuantity = dto.StockQuantity;
            component.MinStockThreshold = dto.MinStockThreshold;
            component.LeadTimeDays = dto.LeadTimeDays;
            component.WeightGrams = dto.WeightGrams;
            component.CostPrice = dto.CostPrice;

            await _adminRepository.UpdateAsync(component);

            _logger.LogInformation("Component updated: {ComponentId}", id);

            return Ok(MapToDetailDto(component));
        }

        /// <summary>
        /// Eliminar un componente y todas sus relaciones
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteComponent(Guid id)
        {
            _logger.LogInformation("Deleting component: {ComponentId}", id);

            var component = await _adminRepository.GetByIdAsync(id);
            if (component == null)
            {
                _logger.LogWarning("Component not found for deletion: {ComponentId}", id);
                return NotFound(new { message = "Componente no encontrado" });
            }

            await _adminRepository.DeleteAsync(component);

            _logger.LogInformation("Component deleted: {ComponentId}", id);
            return NoContent();
        }

        /// <summary>
        /// Actualizar cantidad de stock de un componente
        /// </summary>
        [HttpPatch("{id:guid}/stock")]
        [ProducesResponseType(typeof(ComponentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateStockDto dto)
        {
            _logger.LogInformation("Updating stock for component: {ComponentId}, NewQuantity: {Quantity}", id, dto.Quantity);

            var component = await _adminRepository.GetByIdAsync(id);
            if (component == null)
            {
                _logger.LogWarning("Component not found for stock update: {ComponentId}", id);
                return NotFound(new { message = "Componente no encontrado" });
            }

            component.StockQuantity = dto.Quantity;

            await _adminRepository.UpdateAsync(component);

            _logger.LogInformation("Stock updated for component: {ComponentId}, NewQuantity: {Quantity}", id, dto.Quantity);

            return Ok(MapToDetailDto(component));
        }

        /// <summary>
        /// Reemplazar todas las traducciones de un componente
        /// </summary>
        [HttpPut("{id:guid}/translations")]
        [ProducesResponseType(typeof(ComponentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTranslations(Guid id, [FromBody] UpdateComponentTranslationsDto dto)
        {
            _logger.LogInformation("Updating translations for component: {ComponentId}", id);

            var component = await _adminRepository.GetByIdAsync(id);
            if (component == null)
            {
                _logger.LogWarning("Component not found for translation update: {ComponentId}", id);
                return NotFound(new { message = "Componente no encontrado" });
            }

            var translations = dto.Translations.Select(t => new ComponentTranslation
            {
                Id = Guid.NewGuid(),
                Locale = t.Locale,
                Name = t.Name,
                Description = t.Description
            }).ToList();

            await _adminRepository.ReplaceTranslationsAsync(id, translations);

            // Reload with new translations
            component = await _adminRepository.GetByIdAsync(id);

            _logger.LogInformation("Translations updated for component: {ComponentId}", id);

            return Ok(MapToDetailDto(component!));
        }

        /// <summary>
        /// Listar componentes con stock bajo (stock &lt;= umbral mínimo)
        /// </summary>
        [HttpGet("low-stock")]
        [ProducesResponseType(typeof(List<ComponentDetailDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLowStock()
        {
            _logger.LogInformation("Getting low stock components");

            var components = await _adminRepository.GetLowStockAsync();

            var result = components.Select(MapToDetailDto).ToList();
            return Ok(result);
        }

        private static ComponentDetailDto MapToDetailDto(Component component)
        {
            return new ComponentDetailDto
            {
                Id = component.Id,
                Sku = component.Sku,
                ComponentType = component.ComponentType,
                StockQuantity = component.StockQuantity,
                InStock = component.StockQuantity > 0,
                MinStockThreshold = component.MinStockThreshold,
                LowStock = component.StockQuantity <= component.MinStockThreshold,
                LeadTimeDays = component.LeadTimeDays,
                WeightGrams = component.WeightGrams,
                CostPrice = component.CostPrice,
                CreatedAt = component.CreatedAt,
                UpdatedAt = component.UpdatedAt,
                Translations = component.Translations
                    .Select(t => new ComponentTranslationDto
                    {
                        Id = t.Id,
                        Locale = t.Locale,
                        Name = t.Name,
                        Description = t.Description
                    }).ToList()
            };
        }
    }
}
