using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<Order?> GetByIdAsync(Guid orderId)
        {
            return await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<Order?> GetByIdWithItemsAsync(Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetByUserIdWithItemsAsync(Guid userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> CountByOrderNumberPrefixAsync(string prefix)
        {
            return await _context.Orders
                .CountAsync(o => o.OrderNumber.StartsWith(prefix));
        }

        public async Task UpdateAsync(Order order)
        {
            order.UpdatedAt = DateTime.UtcNow;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<Order?> GetByIdWithItemsAndUserAsync(Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<(IEnumerable<Order> Orders, int TotalCount)> GetAllWithUsersAsync(int page, int pageSize, string? status = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Where(o => status == null || o.OrderStatus == status)
                .OrderByDescending(o => o.CreatedAt);

            var totalCount = await query.CountAsync();
            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (orders, totalCount);
        }
    }
}
