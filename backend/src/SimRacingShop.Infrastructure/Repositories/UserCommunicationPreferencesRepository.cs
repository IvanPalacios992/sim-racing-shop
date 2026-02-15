using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class UserCommunicationPreferencesRepository : IUserCommunicationPreferencesRepository
    {
        private readonly ApplicationDbContext _context;

        public UserCommunicationPreferencesRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserCommunicationPreferences?> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserCommunicationPreferences
                .FirstOrDefaultAsync(ucp => ucp.UserId == userId);
        }

        public async Task<UserCommunicationPreferences> CreateAsync(UserCommunicationPreferences preferences)
        {
            _context.UserCommunicationPreferences.Add(preferences);
            await _context.SaveChangesAsync();
            return preferences;
        }

        public async Task UpdateAsync(UserCommunicationPreferences preferences)
        {
            preferences.UpdatedAt = DateTime.UtcNow;
            _context.UserCommunicationPreferences.Update(preferences);
            await _context.SaveChangesAsync();
        }
    }
}
