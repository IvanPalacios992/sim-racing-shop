using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Infrastructure.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByIdAsync(Guid userId);
        Task LogoutAsync(Guid userId);
        Task<bool> ValidateSecurityStampAsync(Guid userId, string securityStamp);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(ResetPasswordRequestDto dto);
    }
}
