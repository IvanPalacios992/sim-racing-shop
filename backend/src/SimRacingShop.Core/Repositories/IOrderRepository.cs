using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateAsync(Order order);
        Task<Order?> GetByIdAsync(Guid orderId);
        Task<Order?> GetByIdWithItemsAsync(Guid orderId);
        Task<Order?> GetByOrderNumberAsync(string orderNumber);
        Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Order>> GetByUserIdWithItemsAsync(Guid userId);
        Task<int> CountByOrderNumberPrefixAsync(string prefix);
        Task UpdateAsync(Order order);
        Task<(IEnumerable<Order> Orders, int TotalCount)> GetAllWithUsersAsync(int page, int pageSize, string? status = null, string? search = null);
        Task<Order?> GetByIdWithItemsAndUserAsync(Guid orderId);
    }
}
