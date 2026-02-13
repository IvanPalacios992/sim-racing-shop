using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Enums;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class UserAddressRepository : IUserAddressRepository
    {
        private readonly ApplicationDbContext _context;

        public UserAddressRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserAddress> CreateAsync(UserAddress userAddress)
        {
            _context.UserAddresses.Add(userAddress);
            await _context.SaveChangesAsync();
            return userAddress;
        }

        public async Task<UserAddress?> GetBillingAddressByUserIdAsync(Guid userId)
        {
            return await _context.UserAddresses
                .FirstOrDefaultAsync(x => x.UserId == userId && x.AddressType == AddressType.Billing);
        }
        public async Task<UserAddress?> GetDeliveryAddressByIdAsync(Guid id)
        {
            return await _context.UserAddresses
                .FirstOrDefaultAsync(x => x.Id == id && x.AddressType == AddressType.Delivery);
        }

        public async Task<IEnumerable<UserAddress>> GetDeliveryAddressesByUserIdAsync(Guid userId)
        {
            return await _context.UserAddresses
                .Where(x => x.UserId == userId && x.AddressType == AddressType.Delivery)
                .ToListAsync();
        }

        public bool ExistBillingAddressForUser(Guid userId)
        {
            return _context.UserAddresses.Any(x => x.UserId == userId && x.AddressType == AddressType.Billing);
        }

        public async Task UpdateAsync(UserAddress userAddress)
        {
            _context.UserAddresses.Update(userAddress);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(UserAddress userAddress)
        {
            _context.UserAddresses.Remove(userAddress);
            await _context.SaveChangesAsync();
        }
    }
}
