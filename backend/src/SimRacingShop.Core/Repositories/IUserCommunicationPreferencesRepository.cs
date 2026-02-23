using SimRacingShop.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SimRacingShop.Core.Repositories
{
    public interface IUserCommunicationPreferencesRepository
    {
        Task<UserCommunicationPreferences?> GetByUserIdAsync(Guid userId);
        Task<UserCommunicationPreferences> CreateAsync(UserCommunicationPreferences preferences);
        Task UpdateAsync(UserCommunicationPreferences preferences);
    }
}
