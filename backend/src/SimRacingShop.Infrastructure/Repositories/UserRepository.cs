using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Enums;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<User> _userManager;

        public UserRepository(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _userManager.FindByIdAsync(userId.ToString());
        }

        public async Task UpdateAsync(User user)
        {
            var existingUser = await _userManager.FindByEmailAsync(user.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("El email ya está registrado");
            }

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Error al crear usuario: {errors}");
            }
        }

        public async Task DeleteAsync(User user)
        {
            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Error al crear usuario: {errors}");
            }
        }
    }
}
