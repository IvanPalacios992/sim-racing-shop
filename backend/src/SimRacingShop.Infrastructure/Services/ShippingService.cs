using Microsoft.Extensions.Logging;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;

namespace SimRacingShop.Infrastructure.Services
{
    public class ShippingService : IShippingService
    {
        private readonly IShippingZoneRepository _shippingZoneRepository;
        private readonly ILogger<ShippingService> _logger;

        public ShippingService(
            IShippingZoneRepository shippingZoneRepository,
            ILogger<ShippingService> logger)
        {
            _shippingZoneRepository = shippingZoneRepository;
            _logger = logger;
        }

        public async Task<decimal> CalculateShippingCostAsync(string postalCode, decimal subtotal, decimal weightKg)
        {
            var shippingZone = await _shippingZoneRepository.GetByPostalCodeAsync(postalCode);

            if (shippingZone == null)
            {
                _logger.LogWarning("No shipping zone found for postal code: {PostalCode}", postalCode);
                throw new InvalidOperationException($"No se encontró configuración de envío para el código postal {postalCode}");
            }

            // Verificar si aplica envío gratis
            if (subtotal >= shippingZone.FreeShippingThreshold)
            {
                _logger.LogInformation(
                    "Free shipping applied for postal code {PostalCode}: subtotal {Subtotal} >= threshold {Threshold}",
                    postalCode,
                    subtotal,
                    shippingZone.FreeShippingThreshold
                );
                return 0m;
            }

            // Calcular coste: base + (peso × coste por kg)
            var shippingCost = shippingZone.BaseCost + (weightKg * shippingZone.CostPerKg);

            _logger.LogDebug(
                "Calculated shipping cost for {PostalCode}: base {Base} + ({Weight}kg × {CostPerKg}) = {Total}",
                postalCode,
                shippingZone.BaseCost,
                weightKg,
                shippingZone.CostPerKg,
                shippingCost
            );

            return Math.Round(shippingCost, 2);
        }

        public async Task<ShippingCalculationDto> GetShippingDetailsAsync(string postalCode, decimal subtotal, decimal weightKg)
        {
            var shippingZone = await _shippingZoneRepository.GetByPostalCodeAsync(postalCode);

            if (shippingZone == null)
            {
                throw new InvalidOperationException($"No se encontró configuración de envío para el código postal {postalCode}");
            }

            var isFreeShipping = subtotal >= shippingZone.FreeShippingThreshold;
            var baseCost = isFreeShipping ? 0m : shippingZone.BaseCost;
            var weightCost = isFreeShipping ? 0m : weightKg * shippingZone.CostPerKg;
            var totalCost = baseCost + weightCost;

            var subtotalNeeded = isFreeShipping
                ? 0m
                : Math.Max(0, shippingZone.FreeShippingThreshold - subtotal);

            return new ShippingCalculationDto
            {
                ZoneName = shippingZone.Name,
                BaseCost = baseCost,
                WeightCost = Math.Round(weightCost, 2),
                TotalCost = Math.Round(totalCost, 2),
                WeightKg = weightKg,
                IsFreeShipping = isFreeShipping,
                FreeShippingThreshold = shippingZone.FreeShippingThreshold,
                SubtotalNeededForFreeShipping = Math.Round(subtotalNeeded, 2)
            };
        }

        public async Task<IEnumerable<ShippingZone>> GetActiveShippingZonesAsync()
        {
            return await _shippingZoneRepository.GetAllActiveAsync();
        }

        public async Task<ShippingZone?> GetShippingZoneByPostalCodeAsync(string postalCode)
        {
            return await _shippingZoneRepository.GetByPostalCodeAsync(postalCode);
        }
    }
}
