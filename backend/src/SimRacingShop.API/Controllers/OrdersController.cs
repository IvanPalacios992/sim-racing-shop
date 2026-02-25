using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de gestión de pedidos
    /// </summary>
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private const string _orderNotFoundError = "Pedido no encontrado";
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            IOrderService orderService,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository;
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Crear un nuevo pedido para el usuario actual
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                // El servicio maneja todas las validaciones y la creación del pedido
                var order = await _orderService.CreateOrderAsync(dto, userId);

                var result = MapToOrderDetailDto(order);

                return CreatedAtAction(
                    actionName: nameof(GetOrderById),
                    routeValues: new { id = order.Id },
                    value: result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Order creation failed for user {UserId}: {Message}", userId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Obtener todos los pedidos del usuario actual
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserOrders()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Fetching orders for user: {UserId}", userId);

            var orders = await _orderRepository.GetByUserIdWithItemsAsync(userId);

            var result = orders.Select(MapToOrderSummaryDto).ToList();

            return Ok(result);
        }

        /// <summary>
        /// Obtener detalle de un pedido específico
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(OrderDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Fetching order: {OrderId} for user: {UserId}", id, userId);

            var order = await _orderRepository.GetByIdWithItemsAsync(id);

            if (order == null)
            {
                _logger.LogWarning("Order not found: {OrderId}", id);
                return NotFound(new { message = _orderNotFoundError });
            }

            // Verificar que el pedido pertenece al usuario actual
            if (order.UserId != userId)
            {
                _logger.LogWarning("User {UserId} attempted to access order {OrderId} belonging to another user", userId, id);
                return Unauthorized(new { message = "No tiene permiso para ver este pedido" });
            }

            var result = MapToOrderDetailDto(order);

            return Ok(result);
        }

        private OrderDetailDto MapToOrderDetailDto(Order order)
        {
            return new OrderDetailDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                ShippingStreet = order.ShippingStreet,
                ShippingCity = order.ShippingCity,
                ShippingState = order.ShippingState,
                ShippingPostalCode = order.ShippingPostalCode,
                ShippingCountry = order.ShippingCountry,
                PaymentId = order.PaymentId,
                Subtotal = order.Subtotal,
                VatAmount = order.VatAmount,
                ShippingCost = order.ShippingCost,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                EstimatedProductionDays = order.EstimatedProductionDays,
                ProductionNotes = order.ProductionNotes,
                TrackingNumber = order.TrackingNumber,
                ShippedAt = order.ShippedAt,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems.Select(MapToOrderItemDetailDto).ToList()
            };
        }

        private OrderItemDetailDto MapToOrderItemDetailDto(OrderItem item)
        {
            return new OrderItemDetailDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                ProductSku = item.ProductSku,
                ConfigurationJson = item.ConfigurationJson,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal,
            };
        }

        private OrderSummaryDto MapToOrderSummaryDto(Order order)
        {
            var orderItems = new List<OrderItemSummaryDto>();

            foreach (var item in order.OrderItems)
            {
                orderItems.Add(new OrderItemSummaryDto
                {
                    Id = item.Id,
                    ProductName = item.ProductName,
                    ProductSku = item.ProductSku,
                    ConfigurationJson = item.ConfigurationJson,
                    Quantity = item.Quantity,
                    LineTotal = item.LineTotal
                });
            }

            return new OrderSummaryDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                CreatedAt = order.CreatedAt,
                Items = orderItems
            };
        }
    }
}
