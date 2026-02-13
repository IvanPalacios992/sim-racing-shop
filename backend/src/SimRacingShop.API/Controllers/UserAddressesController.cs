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
    [Route("api/addresses")]
    [Authorize]
    public class UserAddressesController : ControllerBase
    {
        private const string _addressNotFoundError = "Dirección no encontrada";
        private readonly IUserAddressRepository _userAddressRepository;
        private readonly ILogger<UserAddressesController> _logger;

        public UserAddressesController(IUserAddressRepository userAddressRepository, ILogger<UserAddressesController> logger)
        {
            _userAddressRepository = userAddressRepository;
            _logger = logger;
        }
        /// <summary>
        /// Crear una nueva direccion de facturacion para el usuario actual
        /// </summary>
        [HttpPost("billing")]
        [ProducesResponseType(typeof(BillingAddressDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCurrentUserBillingAddress([FromBody] CreateBillingAddressDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId) || dto.UserId != userId)
            {
                return Unauthorized();
            }

            _logger.LogInformation("Creating billing address");

            var userAddress = new UserAddress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressType = Core.Enums.AddressType.Billing,
                Street = dto.Street,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                IsDefault = true
            };

            await _userAddressRepository.CreateAsync(userAddress);

            _logger.LogInformation("Billing address created: {BillingAddressId}", userAddress.Id);

            var result = MapToBillingAddressDetailDto(userAddress);

            return CreatedAtAction(
                actionName: "GetCurrentUserBillingAddress",
                controllerName: "UserAddresses",
                routeValues: new { id = userAddress.Id },
                value: result);
        }

        /// <summary>
        /// Editar campos de una direción de factucarión
        /// </summary>
        [HttpPut("billing")]
        [ProducesResponseType(typeof(BillingAddressDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCurrentUserBillingAddress([FromBody] UpdateBillingAddressDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Updating Billing address for user: {UserId}", userId);

            var userAddress = await _userAddressRepository.GetBillingAddressByUserIdAsync(userId);
            if (userAddress == null)
            {
                _logger.LogWarning("Billing address not found for update for user: {UserId}", userId);
                return NotFound(new { message = _addressNotFoundError });
            }

            userAddress.Street = dto.Street;
            userAddress.City = dto.City;
            userAddress.State = dto.State;
            userAddress.Country = dto.Country;

            await _userAddressRepository.UpdateAsync(userAddress);

            _logger.LogInformation("Billing address updated for user: {UserId}", userId);

            var result = MapToBillingAddressDetailDto(userAddress);
            return Ok(result);
        }

        /// <summary>
        /// Obtener detalle de direccion de facturación para el usuario actual
        /// </summary>
        [HttpGet("billing")]
        [ProducesResponseType(typeof(BillingAddressDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUserBillingAdress()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var billingAddress = await _userAddressRepository.GetBillingAddressByUserIdAsync(userId);

            if (billingAddress == null)
            {
                _logger.LogWarning("Billing address not found for user: {UserId}", userId);
                return NotFound();
            }

            return Ok(billingAddress);
        }

        /// <summary>
        /// Crear una nueva direccion de envio para el usuario actual
        /// </summary>
        [HttpPost("delivery")]
        [ProducesResponseType(typeof(DeliveryAddressDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCurrentUserDeliveryAddress([FromBody] CreateDeliveryAddressDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId) || dto.UserId != userId)
            {
                return Unauthorized();
            }

            _logger.LogInformation("Creating delivery address");

            var userAddress = new UserAddress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AddressType = Core.Enums.AddressType.Billing,
                Street = dto.Street,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                IsDefault = dto.IsDefault,
                Name = dto.Name
            };

            await _userAddressRepository.CreateAsync(userAddress);

            _logger.LogInformation("Delivery address created: {DeliveryAddressId}", userAddress.Id);

            var result = MapToDeliveryAddressDetailDto(userAddress);

            return CreatedAtAction(
                actionName: "GetCurrentUserDeliveryAddress",
                controllerName: "UserAddresses",
                routeValues: new { id = userAddress.Id },
                value: result);
        }

        /// <summary>
        /// Editar campos de una direción de envio
        /// </summary>
        [HttpPut("delivery/{id:guid}")]
        [ProducesResponseType(typeof(DeliveryAddressDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCurrentUserDeliveryAddress(Guid id, [FromBody] UpdateDeliveryAddressDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Updating delivery address for user: {UserId}", userId);

            var userAddress = await _userAddressRepository.GetDeliveryAddressByIdAsync(id);
            if (userAddress == null)
            {
                _logger.LogWarning("Delivery address not found for update for user: {UserId}", userId);
                return NotFound(new { message = _addressNotFoundError });
            }
            else if (userAddress.UserId != userId)
            {
                return Unauthorized();
            }

            userAddress.Street = dto.Street;
            userAddress.City = dto.City;
            userAddress.State = dto.State;
            userAddress.Country = dto.Country;
            userAddress.Name = dto.Name;
            userAddress.IsDefault = dto.IsDefault;

            await _userAddressRepository.UpdateAsync(userAddress);

            _logger.LogInformation("Delivery address updated for user: {UserId}", userId);

            var result = MapToDeliveryAddressDetailDto(userAddress);
            return Ok(result);
        }

        /// <summary>
        /// Eliminar dirección de envio del usuario actual
        /// </summary>
        [HttpDelete("delivery/{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCurrentUserDeliveryAddress(Guid id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }
            _logger.LogInformation("Deleting delivery address: {DeliveryAddressId}", userId);

            var userAddress = await _userAddressRepository.GetDeliveryAddressByIdAsync(id);
            if (userAddress == null)
            {
                _logger.LogWarning("Delivery address not found for deletion: {DeliveryAddressId}", userId);
                return NotFound(new { message = _addressNotFoundError });
            }
            else if (userAddress.UserId != userId)
            {
                return Unauthorized();
            }

            await _userAddressRepository.DeleteAsync(userAddress);

            _logger.LogInformation("Delivery adress deleted for user: {UserId}", userId);
            return NoContent();
        }

        /// <summary>
        /// Obtener detalle de las direcciones de envio para el usuario actual
        /// </summary>
        [HttpGet("delivery")]
        [ProducesResponseType(typeof(IEnumerable<DeliveryAddressDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUserDeliveryAdresses()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var billinAddress = await _userAddressRepository.GetDeliveryAddressesByUserIdAsync(userId);

            if (!billinAddress.Any())
            {
                _logger.LogWarning("Delivery addresses not found for user: {UserId}", userId);
                return NotFound();
            }

            return Ok(billinAddress);
        }


        private BillingAddressDetailDto MapToBillingAddressDetailDto(UserAddress userAdress)
        {
            return new BillingAddressDetailDto
            {
                Id = userAdress.Id,
                Street = userAdress.Street,
                City = userAdress.City,
                State = userAdress.State,
                Country = userAdress.Country,
                PostalCode = userAdress.PostalCode
            };
        }

        private DeliveryAddressDetailDto MapToDeliveryAddressDetailDto(UserAddress userAdress)
        {
            return new DeliveryAddressDetailDto
            {
                Id = userAdress.Id,
                Name = userAdress.Name ?? string.Empty,
                Street = userAdress.Street,
                City = userAdress.City,
                State = userAdress.State,
                Country = userAdress.Country,
                PostalCode = userAdress.PostalCode,
                IsDefault = userAdress.IsDefault
            };
        }

    }
}
