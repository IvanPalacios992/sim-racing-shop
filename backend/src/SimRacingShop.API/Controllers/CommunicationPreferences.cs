using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.API.Controllers
{
    [Route("api/communication-preferences")]
    [ApiController]
    [Authorize]
    public class CommunicationPreferences : ControllerBase
    {
        private readonly IUserCommunicationPreferencesRepository _communicationPreferencesRepository;
        private readonly ILogger<CommunicationPreferences> _logger;

        public CommunicationPreferences(IUserCommunicationPreferencesRepository communicationPreferencesRepository, ILogger<CommunicationPreferences> logger)
        {
            _communicationPreferencesRepository = communicationPreferencesRepository;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene las preferencias de comunicación del usuario actual
        /// </summary>
        [HttpGet()]
        [ProducesResponseType(typeof(UserCommunicationPreferencesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCommunicationPreferences()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Getting communication preferences for user: {UserId}", userId);

            var preferences = await _communicationPreferencesRepository.GetByUserIdAsync(userId);

            // Si no existen preferencias, crear valores por defecto
            if (preferences == null)
            {
                _logger.LogInformation("Creating default communication preferences for user: {UserId}", userId);

                preferences = new UserCommunicationPreferences
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Newsletter = false,
                    OrderNotifications = true, // Activo por defecto
                    SmsPromotions = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _communicationPreferencesRepository.CreateAsync(preferences);
            }

            var result = MapToCommunicationPreferencesDto(preferences);
            return Ok(result);
        }

        /// <summary>
        /// Actualiza las preferencias de comunicación del usuario actual
        /// </summary>
        [HttpPut()]
        [ProducesResponseType(typeof(UserCommunicationPreferencesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateCommunicationPreferences([FromBody] UserCommunicationPreferencesDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Updating communication preferences for user: {UserId}", userId);

            var preferences = await _communicationPreferencesRepository.GetByUserIdAsync(userId);

            if (preferences == null)
            {
                // Si no existen preferencias, crearlas
                preferences = new UserCommunicationPreferences
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Newsletter = dto.Newsletter,
                    OrderNotifications = dto.OrderNotifications,
                    SmsPromotions = dto.SmsPromotions,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _communicationPreferencesRepository.CreateAsync(preferences);
            }
            else
            {
                // Actualizar preferencias existentes
                preferences.Newsletter = dto.Newsletter;
                preferences.OrderNotifications = dto.OrderNotifications;
                preferences.SmsPromotions = dto.SmsPromotions;

                await _communicationPreferencesRepository.UpdateAsync(preferences);
            }

            _logger.LogInformation("Communication preferences updated for user: {UserId}", userId);

            var result = MapToCommunicationPreferencesDto(preferences);
            return Ok(result);
        }

        private UserCommunicationPreferencesDto MapToCommunicationPreferencesDto(UserCommunicationPreferences preferences)
        {
            return new UserCommunicationPreferencesDto
            {
                Newsletter = preferences.Newsletter,
                OrderNotifications = preferences.OrderNotifications,
                SmsPromotions = preferences.SmsPromotions
            };
        }
    }
}
