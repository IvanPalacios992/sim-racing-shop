using SimRacingShop.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Infrastructure.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByIdAsync(Guid userId);
    }
}
