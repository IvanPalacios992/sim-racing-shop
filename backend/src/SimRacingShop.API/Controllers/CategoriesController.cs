using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints públicos de categorias
    /// </summary>
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ICategoryRepository categoryRepository, ILogger<CategoriesController> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        /// <summary>
        /// Obtener listado paginado de categorias
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResultDto<CategoryListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories([FromQuery] CategoryFilterDto filter)
        {
            _logger.LogInformation(
                "Getting categories - Page: {Page}, PageSize: {PageSize}, Locale: {Locale}",
                filter.Page, filter.PageSize, filter.Locale);

            var result = await _categoryRepository.GetCategoriesAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtener detalle de categoria por ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CategoryDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCategoryById(Guid id, [FromQuery] string locale = "es")
        {
            _logger.LogInformation("Getting category by ID: {CategoryId}, Locale: {Locale}", id, locale);

            var product = await _categoryRepository.GetCategoryByIdAsync(id, locale);

            if (product == null)
            {
                _logger.LogWarning("Category not found: {ProductId}", id);
                return NotFound(new { message = "Catgoria no encontrada" });
            }

            return Ok(product);
        }
    }
}
