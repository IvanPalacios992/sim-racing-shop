using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Services
{
    public interface ICartService
    {
        /// <summary>Devuelve el carrito con detalles de productos y subtotales calculados</summary>
        Task<CartDto> GetCartAsync(string cartKey, string locale);

        /// <summary>
        /// Añade un producto al carrito. Si ya existe, suma la cantidad.
        /// Valida que el producto exista y esté activo.
        /// </summary>
        Task<CartDto> AddItemAsync(string cartKey, AddToCartDto dto, string locale);

        /// <summary>
        /// Actualiza la cantidad de un producto. Lanza KeyNotFoundException si no existe en el carrito.
        /// </summary>
        Task<CartDto> UpdateItemAsync(string cartKey, Guid productId, int quantity, string locale);

        /// <summary>Elimina un producto del carrito</summary>
        Task RemoveItemAsync(string cartKey, Guid productId);

        /// <summary>Vacía el carrito completo</summary>
        Task ClearCartAsync(string cartKey);

        /// <summary>
        /// Fusiona el carrito de sesión anónima en el carrito del usuario autenticado.
        /// Suma cantidades cuando hay coincidencias. Elimina el carrito de sesión.
        /// </summary>
        Task<CartDto> MergeCartsAsync(string sessionKey, string userKey, string locale);
    }
}
