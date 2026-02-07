using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints públicos de productos
    /// </summary>
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductRepository productRepository, ILogger<ProductsController> logger)
        {
            _productRepository = productRepository;
            _logger = logger;
        }

        /// <summary>
        /// Obtener listado paginado de productos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResultDto<ProductListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter)
        {
            _logger.LogInformation(
                "Getting products - Page: {Page}, PageSize: {PageSize}, Locale: {Locale}, Search: {Search}",
                filter.Page, filter.PageSize, filter.Locale, filter.Search);

            var result = await _productRepository.GetProductsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Obtener detalle de producto por ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductById(Guid id, [FromQuery] string locale = "es")
        {
            _logger.LogInformation("Getting product by ID: {ProductId}, Locale: {Locale}", id, locale);

            var product = await _productRepository.GetProductByIdAsync(id, locale);

            if (product == null)
            {
                _logger.LogWarning("Product not found: {ProductId}", id);
                return NotFound(new { message = "Producto no encontrado" });
            }

            return Ok(product);
        }

        /// <summary>
        /// Obtener detalle de producto por slug
        /// </summary>
        [HttpGet("slug/{slug}")]
        [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductBySlug(string slug, [FromQuery] string locale = "es")
        {
            _logger.LogInformation("Getting product by slug: {Slug}, Locale: {Locale}", slug, locale);

            var product = await _productRepository.GetProductBySlugAsync(slug, locale);

            if (product == null)
            {
                _logger.LogWarning("Product not found by slug: {Slug}", slug);
                return NotFound(new { message = "Producto no encontrado" });
            }

            return Ok(product);
        }
    }
}
