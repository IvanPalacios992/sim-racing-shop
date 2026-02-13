using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(Guid userId);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

    }
}
