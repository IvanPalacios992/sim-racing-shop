using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Services;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints para cálculo de costes de envío
    /// </summary>
    [ApiController]
    [Route("api/shipping")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;
        private readonly ILogger<ShippingController> _logger;

        public ShippingController(
            IShippingService shippingService,
            ILogger<ShippingController> logger)
        {
            _shippingService = shippingService;
            _logger = logger;
        }

        /// <summary>
        /// Calcula el coste de envío para un código postal, subtotal y peso dados
        /// </summary>
        [HttpPost("calculate")]
        [ProducesResponseType(typeof(ShippingCalculationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CalculateShipping([FromBody] CalculateShippingRequestDto request)
        {
            try
            {
                _logger.LogInformation(
                    "Calculating shipping for postal code {PostalCode}, subtotal {Subtotal}, weight {Weight}kg",
                    request.PostalCode,
                    request.Subtotal,
                    request.WeightKg
                );

                var result = await _shippingService.GetShippingDetailsAsync(
                    request.PostalCode,
                    request.Subtotal,
                    request.WeightKg
                );

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Shipping calculation failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene todas las zonas de envío disponibles
        /// </summary>
        [HttpGet("zones")]
        [ProducesResponseType(typeof(IEnumerable<ShippingZoneDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetShippingZones()
        {
            var zones = await _shippingService.GetActiveShippingZonesAsync();

            var result = zones.Select(z => new ShippingZoneDto
            {
                Name = z.Name,
                BaseCost = z.BaseCost,
                CostPerKg = z.CostPerKg,
                FreeShippingThreshold = z.FreeShippingThreshold
            });

            return Ok(result);
        }

        /// <summary>
        /// Obtiene información de la zona de envío para un código postal específico
        /// </summary>
        [HttpGet("zone/{postalCode}")]
        [ProducesResponseType(typeof(ShippingZoneDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetShippingZoneByPostalCode(string postalCode)
        {
            var zone = await _shippingService.GetShippingZoneByPostalCodeAsync(postalCode);

            if (zone == null)
            {
                return NotFound(new { message = $"No se encontró zona de envío para el código postal {postalCode}" });
            }

            var result = new ShippingZoneDto
            {
                Name = zone.Name,
                BaseCost = zone.BaseCost,
                CostPerKg = zone.CostPerKg,
                FreeShippingThreshold = zone.FreeShippingThreshold
            };

            return Ok(result);
        }
    }
}
