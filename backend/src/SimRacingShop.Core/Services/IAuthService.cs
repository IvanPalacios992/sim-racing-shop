using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<UserDetailDto?> GetUserByIdAsync(Guid userId);
        Task LogoutAsync(Guid userId);
        Task<bool> ValidateSecurityStampAsync(Guid userId, string securityStamp);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(ResetPasswordRequestDto dto);
    }
}
