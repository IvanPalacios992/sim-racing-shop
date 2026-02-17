using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Services
{
    public interface IShippingService
    {
        /// <summary>
        /// Calcula el coste de envío basándose en el código postal, subtotal y peso
        /// </summary>
        /// <param name="postalCode">Código postal de destino</param>
        /// <param name="subtotal">Subtotal del pedido (sin IVA)</param>
        /// <param name="weightKg">Peso total en kilogramos</param>
        /// <returns>Coste de envío calculado</returns>
        Task<decimal> CalculateShippingCostAsync(string postalCode, decimal subtotal, decimal weightKg);

        /// <summary>
        /// Obtiene información detallada del envío para un código postal
        /// </summary>
        Task<ShippingCalculationDto> GetShippingDetailsAsync(string postalCode, decimal subtotal, decimal weightKg);

        /// <summary>
        /// Obtiene todas las zonas de envío activas
        /// </summary>
        Task<IEnumerable<ShippingZone>> GetActiveShippingZonesAsync();

        /// <summary>
        /// Obtiene la zona de envío para un código postal específico
        /// </summary>
        Task<ShippingZone?> GetShippingZoneByPostalCodeAsync(string postalCode);
    }
}
