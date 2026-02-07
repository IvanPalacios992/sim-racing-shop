using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Settings;
using SimRacingShop.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SimRacingShop.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ApplicationDbContext context,
            IOptions<JwtSettings> jwtSettings,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("El email ya está registrado");
            }

            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Language = dto.Language,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Error al crear usuario: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "Customer");

            var token = await GenerateJwtToken(user);
            var refreshToken = await CreateRefreshTokenAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = await MapUserToDto(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                throw new InvalidOperationException("Email o contraseña incorrectos");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                {
                    throw new InvalidOperationException("Cuenta bloqueada temporalmente");
                }
                throw new InvalidOperationException("Email o contraseña incorrectos");
            }

            var token = await GenerateJwtToken(user);
            var refreshToken = await CreateRefreshTokenAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = await MapUserToDto(user)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null)
            {
                throw new InvalidOperationException("Refresh token inválido");
            }

            if (!storedToken.IsActive)
            {
                // Revocar todos los tokens por seguridad, alguien esta intentado reutilizar tokens ya utilizados
                await RevokeAllUserRefreshTokens(storedToken.UserId);
                await _userManager.UpdateSecurityStampAsync(storedToken.User);
                throw new InvalidOperationException("Refresh token expirado o revocado");
            }

            var user = storedToken.User;

            // Revocar el token actual
            storedToken.RevokedAt = DateTime.UtcNow;

            // Crear nuevo refresh token
            var newRefreshToken = await CreateRefreshTokenAsync(user);
            storedToken.ReplacedByToken = newRefreshToken.Token;

            await _context.SaveChangesAsync();

            // Generar nuevo JWT
            var token = await GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = newRefreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = await MapUserToDto(user)
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            return user != null ? await MapUserToDto(user) : null;
        }

        public async Task LogoutAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new InvalidOperationException("Usuario no encontrado");
            }

            // Revocar todos los refresh tokens activos del usuario
            await RevokeAllUserRefreshTokens(userId);

            // Actualizar SecurityStamp para invalidar JWTs existentes
            await _userManager.UpdateSecurityStampAsync(user);
        }

        public async Task<bool> ValidateSecurityStampAsync(Guid userId, string securityStamp)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return false;
            }

            var currentStamp = await _userManager.GetSecurityStampAsync(user);
            return currentStamp == securityStamp;
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            // Por seguridad, no revelamos si el email existe o no
            if (user == null)
            {
                return;
            }

            // Generar token de reset (ASP.NET Identity lo maneja internamente)
            // El token es de un solo uso y tiene expiración configurable
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            var userName = user.FirstName ?? user.Email ?? "Usuario";

            await _emailService.SendPasswordResetEmailAsync(user.Email!, resetToken, userName);
        }

        public async Task ResetPasswordAsync(ResetPasswordRequestDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                throw new InvalidOperationException("Token inválido o expirado");
            }

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();

                // Verificar si el error es por token inválido/expirado
                if (errors.Any(e => e.Contains("Invalid token", StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidOperationException("Token inválido o expirado");
                }

                throw new InvalidOperationException($"Error al restablecer contraseña: {string.Join(", ", errors)}");
            }

            // Actualizar SecurityStamp para invalidar tokens JWT existentes
            await _userManager.UpdateSecurityStampAsync(user);

            // Revocar todos los refresh tokens activos
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        private async Task<RefreshToken> CreateRefreshTokenAsync(User user)
        {
            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = GenerateRefreshTokenString(),
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        private async Task RevokeAllUserRefreshTokens(Guid userId)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var securityStamp = await _userManager.GetSecurityStampAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("language", user.Language),
                new Claim("security_stamp", securityStamp ?? string.Empty)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshTokenString()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private async Task<UserDto> MapUserToDto(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Language = user.Language,
                EmailVerified = user.EmailConfirmed,
                Roles = roles
            };
        }
    }
}
