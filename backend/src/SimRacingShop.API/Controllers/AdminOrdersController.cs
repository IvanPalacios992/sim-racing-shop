using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;

namespace SimRacingShop.API.Controllers
{
    /// <summary>
    /// Endpoints de administración de pedidos (requiere rol Admin)
    /// </summary>
    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private static readonly Dictionary<string, string?> ValidTransitions = new()
        {
            ["pending"] = "processing",
            ["processing"] = "shipped",
            ["shipped"] = "delivered",
            ["delivered"] = null,
            ["cancelled"] = null,
        };

        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<AdminOrdersController> _logger;

        public AdminOrdersController(
            IOrderRepository orderRepository,
            ILogger<AdminOrdersController> logger)
        {
            _orderRepository = orderRepository;
            _logger = logger;
        }

        /// <summary>
        /// Lista paginada de todos los pedidos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResultDto<AdminOrderSummaryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOrders([FromQuery] int Page = 1, [FromQuery] int PageSize = 20, [FromQuery] string? Status = null)
        {
            _logger.LogInformation("Admin listing orders page={Page} pageSize={PageSize} status={Status}", Page, PageSize, Status);

            var (orders, totalCount) = await _orderRepository.GetAllWithUsersAsync(Page, PageSize, Status);

            var items = orders.Select(o => new AdminOrderSummaryDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                UserEmail = o.User?.Email,
                TotalAmount = o.TotalAmount,
                OrderStatus = o.OrderStatus,
                CreatedAt = o.CreatedAt,
                ItemCount = o.OrderItems.Count,
            }).ToList();

            var totalPages = (int)Math.Ceiling(totalCount / (double)PageSize);

            return Ok(new PaginatedResultDto<AdminOrderSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = Page,
                PageSize = PageSize,
                TotalPages = totalPages,
            });
        }

        /// <summary>
        /// Detalle completo de un pedido
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(AdminOrderDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            _logger.LogInformation("Admin fetching order {OrderId}", id);

            var order = await _orderRepository.GetByIdWithItemsAndUserAsync(id);
            if (order == null)
                return NotFound(new { message = "Pedido no encontrado" });

            var result = MapToAdminDetailDto(order);
            return Ok(result);
        }

        /// <summary>
        /// Avanzar el estado de un pedido
        /// </summary>
        [HttpPatch("{id:guid}/status")]
        [ProducesResponseType(typeof(AdminOrderDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
        {
            _logger.LogInformation("Admin updating status for order {OrderId} to {Status}", id, dto.Status);

            var order = await _orderRepository.GetByIdWithItemsAndUserAsync(id);
            if (order == null)
                return NotFound(new { message = "Pedido no encontrado" });

            var currentStatus = order.OrderStatus;

            if (!ValidTransitions.TryGetValue(currentStatus, out var nextStatus))
                return BadRequest(new { message = $"Estado actual desconocido: {currentStatus}" });

            if (nextStatus == null)
                return BadRequest(new { message = $"El pedido ya está en estado terminal: {currentStatus}" });

            if (dto.Status != nextStatus)
                return BadRequest(new { message = $"Transición no válida de '{currentStatus}' a '{dto.Status}'. El siguiente estado debe ser '{nextStatus}'." });

            order.OrderStatus = dto.Status;
            await _orderRepository.UpdateAsync(order);

            _logger.LogInformation("Order {OrderId} status updated from {OldStatus} to {NewStatus}", id, currentStatus, dto.Status);

            var result = MapToAdminDetailDto(order);
            return Ok(result);
        }

        private static AdminOrderDetailDto MapToAdminDetailDto(Core.Entities.Order order)
        {
            return new AdminOrderDetailDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                UserEmail = order.User?.Email,
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
                OrderItems = order.OrderItems.Select(i => new OrderItemDetailDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    ProductSku = i.ProductSku,
                    ConfigurationJson = i.ConfigurationJson,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    LineTotal = i.LineTotal,
                }).ToList(),
            };
        }
    }
}
