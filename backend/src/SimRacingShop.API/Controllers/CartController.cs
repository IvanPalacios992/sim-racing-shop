using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Services;
using System.Security.Claims;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Gestión del carrito de compra.
    ///
    /// Usuarios autenticados: el carrito se identifica por JWT (userId).
    /// Usuarios anónimos: enviar header <c>X-Cart-Session: {uuid}</c> generado en el cliente.
    ///
    /// Al hacer login, llamar a POST /api/cart/merge para fusionar el carrito anónimo
    /// con el del usuario recién autenticado.
    /// </summary>
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        private const string SessionHeader = "X-Cart-Session";

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        /// <summary>Obtiene el carrito actual con subtotales calculados</summary>
        [HttpGet]
        [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetCart([FromQuery] string locale = "es")
        {
            var cartKey = ResolveCartKey();
            if (cartKey is null)
                return BadRequest(new { message = $"Se requiere autenticación o el header '{SessionHeader}' para acceder al carrito." });

            var cart = await _cartService.GetCartAsync(cartKey, locale);
            return Ok(cart);
        }

        /// <summary>Añade un producto al carrito. Si ya existe, incrementa la cantidad.</summary>
        [HttpPost("items")]
        [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddItem([FromBody] AddToCartDto dto, [FromQuery] string locale = "es")
        {
            var cartKey = ResolveCartKey();
            if (cartKey is null)
                return BadRequest(new { message = $"Se requiere autenticación o el header '{SessionHeader}' para acceder al carrito." });

            try
            {
                var cart = await _cartService.AddItemAsync(cartKey, dto, locale);
                return Ok(cart);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("AddItem: {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Actualiza la cantidad de un producto existente en el carrito</summary>
        [HttpPut("items/{productId:guid}")]
        [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateItem(
            Guid productId,
            [FromBody] UpdateCartItemDto dto,
            [FromQuery] string locale = "es")
        {
            var cartKey = ResolveCartKey();
            if (cartKey is null)
                return BadRequest(new { message = $"Se requiere autenticación o el header '{SessionHeader}' para acceder al carrito." });

            try
            {
                var cart = await _cartService.UpdateItemAsync(cartKey, productId, dto.Quantity, locale);
                return Ok(cart);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Elimina un producto del carrito</summary>
        [HttpDelete("items/{productId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RemoveItem(Guid productId)
        {
            var cartKey = ResolveCartKey();
            if (cartKey is null)
                return BadRequest(new { message = $"Se requiere autenticación o el header '{SessionHeader}' para acceder al carrito." });

            await _cartService.RemoveItemAsync(cartKey, productId);
            return NoContent();
        }

        /// <summary>Vacía el carrito completo</summary>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ClearCart()
        {
            var cartKey = ResolveCartKey();
            if (cartKey is null)
                return BadRequest(new { message = $"Se requiere autenticación o el header '{SessionHeader}' para acceder al carrito." });

            await _cartService.ClearCartAsync(cartKey);
            return NoContent();
        }

        /// <summary>
        /// Fusiona el carrito de sesión anónima en el carrito del usuario autenticado.
        /// Llamar inmediatamente después del login con el sessionId que se venía usando.
        /// Si hay productos repetidos, las cantidades se suman.
        /// El carrito de sesión queda eliminado tras la fusión.
        /// </summary>
        [HttpPost("merge")]
        [Authorize]
        [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MergeCart([FromBody] MergeCartDto dto, [FromQuery] string locale = "es")
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var sessionKey = $"cart:session:{dto.SessionId}";
            var userKey = $"cart:user:{userId}";

            var cart = await _cartService.MergeCartsAsync(sessionKey, userKey, locale);
            return Ok(cart);
        }

        // --- Helpers ---

        /// <summary>
        /// Determina la clave del carrito según el contexto:
        /// - Autenticado: cart:user:{userId}
        /// - Anónimo con header: cart:session:{sessionId}
        /// - Sin identificación: null (error)
        /// </summary>
        private string? ResolveCartKey()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return string.IsNullOrEmpty(userId) ? null : $"cart:user:{userId}";
            }

            var sessionId = Request.Headers[SessionHeader].FirstOrDefault();
            return string.IsNullOrEmpty(sessionId) ? null : $"cart:session:{sessionId}";
        }
    }
}
