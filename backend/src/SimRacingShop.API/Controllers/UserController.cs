using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints públicos de productos
    /// </summary>
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private const string _userNotFoundError = "Usuario no encontrado";
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserRepository userRepository,
            IUserCommunicationPreferencesRepository communicationPreferencesRepository,
            ILogger<UserController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <summary>
        /// Edita los campos del usuario actual
        /// </summary>
        [HttpPut()]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCurrentUserAddress([FromBody] UpdateUserDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Updating user: {UserId}", userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                return NotFound(new { message = _userNotFoundError });
            }

            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Updated user: {UserId}", userId);

            var result = MapToUserDto(user);
            return Ok(result);
        }

        /// <summary>
        /// Elimina el usuario actual
        /// </summary>
        [HttpDelete()]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCurrentUser()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }
            _logger.LogInformation("Deleting user: {UserId}", userId);

            var userAddress = await _userRepository.GetUserByIdAsync(userId);
            if (userAddress == null)
            {
                _logger.LogWarning("User not found for deletion: {UserId}", userId);
                return NotFound(new { message = _userNotFoundError });
            }

            await _userRepository.DeleteAsync(userAddress);

            _logger.LogInformation("User deleted: {UserId}", userId);
            return NoContent();
        }

        private UserDetailDto MapToUserDto(User user)
        {
            return new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Language = user.Language
            };
        }
    }
}
