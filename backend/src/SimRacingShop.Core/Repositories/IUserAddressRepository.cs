using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IUserAddressRepository
    {
        Task<UserAddress> CreateAsync(UserAddress userAddress);
        Task<UserAddress?> GetBillingAddressByUserIdAsync(Guid userId);
        Task<UserAddress?> GetDeliveryAddressByIdAsync(Guid id);
        Task<IEnumerable<UserAddress>> GetDeliveryAddressesByUserIdAsync(Guid userId);
        bool ExistBillingAddressForUser(Guid userId);
        Task UpdateAsync(UserAddress userAddress);
        Task DeleteAsync(UserAddress userAddress);
        
    }
}
