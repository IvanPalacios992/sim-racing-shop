using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Services
{
    public interface IOrderService
    {
        /// <summary>
        /// Crea un nuevo pedido validando productos, precios y disponibilidad
        /// </summary>
        Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid userId);

        /// <summary>
        /// Valida que todos los productos del pedido existan y estén disponibles
        /// </summary>
        Task ValidateOrderProductsAsync(CreateOrderDto dto);

        /// <summary>
        /// Genera un número de orden único
        /// </summary>
        Task<string> GenerateUniqueOrderNumberAsync();
    }
}
