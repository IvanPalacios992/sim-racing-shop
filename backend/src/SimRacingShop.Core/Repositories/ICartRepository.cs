namespace SimRacingShop.Core.Repositories
{
    public interface ICartRepository
    {
        /// <summary>Devuelve todos los items del carrito: productId -> quantity</summary>
        Task<Dictionary<string, int>> GetAllItemsAsync(string cartKey);

        /// <summary>Añade o actualiza la cantidad de un producto y refresca el TTL</summary>
        Task SetItemAsync(string cartKey, string productId, int quantity, TimeSpan ttl);

        /// <summary>Elimina un producto del hash. Devuelve true si existía.</summary>
        Task<bool> RemoveItemAsync(string cartKey, string productId);

        /// <summary>Elimina el carrito completo</summary>
        Task DeleteCartAsync(string cartKey);

        /// <summary>
        /// Fusiona sourceKey en destKey sumando cantidades. Borra sourceKey al terminar.
        /// </summary>
        Task MergeAsync(string sourceKey, string destKey, TimeSpan destTtl);

        /// <summary>Refresca el TTL del carrito sin modificar contenido</summary>
        Task RefreshTtlAsync(string cartKey, TimeSpan ttl);

        /// <summary>Comprueba si el carrito existe en Redis</summary>
        Task<bool> ExistsAsync(string cartKey);
    }
}
