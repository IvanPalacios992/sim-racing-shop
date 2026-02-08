using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints públicos de componentes
    /// </summary>
    [ApiController]
    [Route("api/components")]
    public class ComponentsController : ControllerBase
    {
        private readonly IComponentRepository _componentRepository;
        private readonly ILogger<ComponentsController> _logger;

        public ComponentsController(IComponentRepository componentRepository, ILogger<ComponentsController> logger)
        {
            _componentRepository = componentRepository;
            _logger = logger;
        }

        /// <summary>
        /// Obtener listado paginado de componentes
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResultDto<ComponentListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComponents([FromQuery] ComponentFilterDto filter)
        {
            _logger.LogInformation(
                "Getting components - Page: {Page}, PageSize: {PageSize}, Locale: {Locale}, Type: {ComponentType}, InStock: {InStock}",
                filter.Page, filter.PageSize, filter.Locale, filter.ComponentType, filter.InStock);

            var result = await _componentRepository.GetComponentsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtener componentes disponibles para un producto
        /// </summary>
        [HttpGet("product/{productId:guid}")]
        [ProducesResponseType(typeof(List<ProductComponentOptionDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComponentsByProductId(Guid productId, [FromQuery] string locale = "es")
        {
            _logger.LogInformation(
                "Getting components for product: {ProductId}, Locale: {Locale}",
                productId, locale);

            var result = await _componentRepository.GetComponentsByProductIdAsync(productId, locale);
            return Ok(result);
        }
    }
}
