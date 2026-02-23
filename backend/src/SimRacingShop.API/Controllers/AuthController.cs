using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Services;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de autenticación
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Registrar nuevo usuario
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                if (dto.Password != dto.ConfirmPassword)
                {
                    return BadRequest(new { message = "Las contraseñas no coinciden" });
                }

                var response = await _authService.RegisterAsync(dto);

                _logger.LogInformation("User registered: {Email}", dto.Email);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed for {Email}", dto.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Iniciar sesión
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto);

                _logger.LogInformation("User logged in: {Email}", dto.Email);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Login failed for {Email}", dto.Email);
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Refrescar token JWT usando refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(dto.RefreshToken);

                _logger.LogInformation("Token refreshed for user: {UserId}", response.User.Id);

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Token refresh failed");
                return Unauthorized(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Solicitar restablecimiento de contraseña
        /// </summary>
        /// <remarks>
        /// Por motivos de seguridad, este endpoint siempre devuelve 200 OK
        /// independientemente de si el email existe o no.
        /// </remarks>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            try
            {
                await _authService.ForgotPasswordAsync(dto.Email);

                _logger.LogInformation("Password reset requested for email: {Email}", dto.Email);
            }
            catch (Exception ex)
            {
                // Log the error but don't reveal it to the user
                _logger.LogError(ex, "Error processing password reset for {Email}", dto.Email);
            }

            // Always return success for security reasons
            return Ok(new { message = "Si el email existe, recibirás un correo con instrucciones para restablecer tu contraseña." });
        }

        /// <summary>
        /// Restablecer contraseña con token
        /// </summary>
        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto);

                _logger.LogInformation("Password reset completed for email: {Email}", dto.Email);

                return Ok(new { message = "Contraseña restablecida exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Password reset failed for {Email}", dto.Email);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtener usuario actual
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        /// <summary>
        /// Endpoint de prueba protegido
        /// </summary>
        [Authorize]
        [HttpGet("test-auth")]
        public IActionResult TestAuth()
        {
            return Ok(new
            {
                message = "You are authenticated!",
                user = User.Identity?.Name,
                roles = User.Claims
                    .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                    .Select(c => c.Value)
            });
        }

        /// <summary>
        /// Endpoint solo para administradores
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnly()
        {
            return Ok(new { message = "You are an admin!" });
        }

        /// <summary>
        /// Cerrar sesión del usuario actual
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                await _authService.LogoutAsync(userId);

                _logger.LogInformation("User logged out: {UserId}", userId);

                return Ok(new { message = "Sesión cerrada exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Logout failed for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
