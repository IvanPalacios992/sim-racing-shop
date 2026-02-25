using Microsoft.Extensions.Logging;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;

namespace SimRacingShop.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductAdminRepository _productRepository;
        private readonly IComponentRepository _componentRepository;
        private readonly IShippingService _shippingService;
        private readonly ILogger<OrderService> _logger;
        private static readonly SemaphoreSlim _orderNumberSemaphore = new(1, 1);

        private decimal _calculatedSubtotal = 0;
        private int _totalWeightGrams = 0;

        public OrderService(
            IOrderRepository orderRepository,
            IProductAdminRepository productRepository,
            IComponentRepository componentRepository,
            IShippingService shippingService,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _componentRepository = componentRepository;
            _shippingService = shippingService;
            _logger = logger;
        }

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid userId)
        {
            _logger.LogInformation("Creating order for user {UserId}", userId);

            // Validar productos antes de crear el pedido
            await ValidateOrderProductsAsync(dto);

            // Generar identificador de pedido
            var orderId = Guid.NewGuid();

            // Generar número de orden único
            var orderNumber = await GenerateUniqueOrderNumberAsync();

            // SEGURIDAD: Recalcular todos los totales en el backend
            var productionDays = new List<int>();
            var orderItems = new List<OrderItem>();

            foreach (var itemDto in dto.OrderItems)
            {

                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                {
                    throw new InvalidOperationException($"Producto {itemDto.ProductId} no encontrado");
                }

                var calculatedPrice = await CalculateProductPriceAsync(product, itemDto.SelectedComponentIds);
                var calculatedLineTotal = calculatedPrice * itemDto.Quantity;

                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderId,
                    ProductId = itemDto.ProductId,
                    ProductName = itemDto.ProductName,
                    ProductSku = product.Sku, // Usar el SKU real del producto
                    ConfigurationJson = string.IsNullOrWhiteSpace(itemDto.ConfigurationJson) ? null : itemDto.ConfigurationJson,
                    Quantity = itemDto.Quantity,
                    UnitPrice = calculatedPrice, // Usar precio calculado
                    LineTotal = calculatedLineTotal, // Usar total calculado
                };
                productionDays.Add(product.BaseProductionDays);
                orderItems.Add(orderItem);
            }

            var totalWeightKg = _totalWeightGrams / 1000m;
            var calculatedVat = _calculatedSubtotal * 0.21m; // 21% IVA
            var calculatedShippingCost = await _shippingService.CalculateShippingCostAsync(
                dto.ShippingPostalCode,
                _calculatedSubtotal,
                totalWeightKg
            );
            var calculatedTotal = _calculatedSubtotal + calculatedVat + calculatedShippingCost;

            var order = new Order
            {
                Id = orderId,
                OrderNumber = orderNumber,
                UserId = userId,
                ShippingStreet = dto.ShippingStreet,
                ShippingCity = dto.ShippingCity,
                ShippingState = dto.ShippingState,
                ShippingPostalCode = dto.ShippingPostalCode,
                ShippingCountry = dto.ShippingCountry,
                Subtotal = Math.Round(_calculatedSubtotal, 2), // Usar subtotal calculado
                VatAmount = Math.Round(calculatedVat, 2), // Usar IVA calculado
                ShippingCost = Math.Round(calculatedShippingCost, 2), // Usar envío calculado
                TotalAmount = Math.Round(calculatedTotal, 2), // Usar total calculado
                Notes = dto.Notes,
                OrderStatus = "pending",
                OrderItems = orderItems,
                EstimatedProductionDays = productionDays?.Max()
            };

            await _orderRepository.CreateAsync(order);

            _logger.LogInformation("Order created successfully: {OrderNumber}", orderNumber);

            return order;
        }

        private async Task<List<string>> ValidateOrderItemAsync(CreateOrderItemDto item, Product product)
        {
            List<string> errors = new List<string>();
            // Validar que el producto esté activo
            if (!product.IsActive)
            {
                errors.Add($"El producto '{product.Sku}' no está disponible para pedidos");
                return errors;
            }

            // Validar que el SKU coincida
            if (product.Sku != item.ProductSku)
            {
                errors.Add($"El SKU del producto no coincide (esperado: {product.Sku}, recibido: {item.ProductSku})");
            }

            // SEGURIDAD: Calcular el precio real en el backend usando los IDs de componentes
            var priceModifier = item.SelectedComponentIds is { Count: > 0 }
                ? await _componentRepository.GetPriceModifiersSumAsync(product.Id, item.SelectedComponentIds)
                : 0m;

            var calculatedUnitSubtotal = Math.Round(product.BasePrice + priceModifier, 2);
            var calculatedPrice = Math.Round(calculatedUnitSubtotal * (1 + product.VatRate / 100), 2);
            var calculatedLineSubtotal = Math.Round(calculatedUnitSubtotal * item.Quantity, 2);
            var calculatedLineTotal = Math.Round(calculatedPrice * item.Quantity, 2);

            // Tolerancia de 0.01€ por redondeos
            var priceDifference = Math.Abs(calculatedPrice - item.UnitPrice);
            var unitSubtotalDifference = Math.Abs(calculatedUnitSubtotal - item.UnitSubtotal);
            var lineTotalDifference = Math.Abs(calculatedLineTotal - item.LineTotal);
            var lineSubtotalDifference = Math.Abs(calculatedLineSubtotal - item.LineSubtotal);

            if (priceDifference > 0.01m)
            {
                errors.Add($"Precio unitario incorrecto para '{product.Sku}': esperado {calculatedPrice:F2}€ (con IVA), recibido {item.UnitPrice:F2}€");
            }

            if (unitSubtotalDifference > 0.01m)
            {
                errors.Add($"Precio unitario sin IVA incorrecto para '{product.Sku}': esperado {calculatedUnitSubtotal:F2}€, recibido {item.UnitSubtotal:F2}€");
            }

            if (lineTotalDifference > 0.01m)
            {
                errors.Add($"Total de línea incorrecto para '{product.Sku}': esperado {calculatedLineTotal:F2}€ (con IVA), recibido {item.LineTotal:F2}€");
            }

            if (lineSubtotalDifference > 0.01m)
            {
                errors.Add($"Total de línea sin IVA incorrecto para '{product.Sku}': esperado {calculatedLineSubtotal:F2}€, recibido {item.LineSubtotal:F2}€");
            }

            if (product?.WeightGrams.HasValue == true)
            {
                _totalWeightGrams += product.WeightGrams.Value * item.Quantity;
            }

            // Acumular el subtotal calculado (sin IVA)
            _calculatedSubtotal += calculatedLineSubtotal;
            return errors;
        }

        public async Task ValidateOrderProductsAsync(CreateOrderDto dto)
        {
            var errors = new List<string>();
            foreach (var item in dto.OrderItems)
            {
                // Si el item tiene ProductId, validar el producto
                var product = await _productRepository.GetByIdAsync(item.ProductId);

                if (product == null)
                {
                    errors.Add($"El producto con ID {item.ProductId} no existe");
                    return;
                }
                List<string> itemErrors = await ValidateOrderItemAsync(item, product);
                if (itemErrors.Any())
                {
                    errors.AddRange(itemErrors);
                }
            }

            // Validar el subtotal
            var subtotalDifference = Math.Abs(_calculatedSubtotal - dto.Subtotal);
            if (subtotalDifference > 0.01m)
            {
                errors.Add($"Subtotal incorrecto: esperado {_calculatedSubtotal:F2}€, recibido {dto.Subtotal:F2}€");
            }

            // Validar el IVA (asumiendo 21% sobre subtotal)
            var calculatedVat = _calculatedSubtotal * 0.21m;
            var vatDifference = Math.Abs(calculatedVat - dto.VatAmount);
            if (vatDifference > 0.01m)
            {
                errors.Add($"IVA incorrecto: esperado {calculatedVat:F2}€, recibido {dto.VatAmount:F2}€");
            }

            // SEGURIDAD: Validar el coste de envío calculado en backend
            var totalWeightKg = _totalWeightGrams / 1000m;
            var calculatedShippingCost = await _shippingService.CalculateShippingCostAsync(
                dto.ShippingPostalCode,
                _calculatedSubtotal,
                totalWeightKg
            );

            var shippingDifference = Math.Abs(calculatedShippingCost - dto.ShippingCost);
            if (shippingDifference > 0.01m)
            {
                errors.Add($"Coste de envío incorrecto: esperado {calculatedShippingCost:F2}€, recibido {dto.ShippingCost:F2}€");
            }

            // Validar el total (subtotal + IVA + envío)
            var calculatedTotal = _calculatedSubtotal + calculatedVat + calculatedShippingCost;
            var totalDifference = Math.Abs(calculatedTotal - dto.TotalAmount);
            if (totalDifference > 0.01m)
            {
                errors.Add($"Total incorrecto: esperado {calculatedTotal:F2}€, recibido {dto.TotalAmount:F2}€");
            }

            if (errors.Any())
            {
                var errorMessage = string.Join("; ", errors);
                _logger.LogWarning("Order validation failed: {Errors}", errorMessage);
                throw new InvalidOperationException(errorMessage);
            }
        }

        /// <summary>
        /// Calcula el precio real de un producto sumando el precio base con IVA
        /// más los modificadores de los componentes seleccionados.
        /// </summary>
        private async Task<decimal> CalculateProductPriceAsync(Product product, List<Guid>? selectedComponentIds)
        {
            var priceModifier = 0m;

            if (selectedComponentIds is { Count: > 0 })
            {
                priceModifier = await _componentRepository.GetPriceModifiersSumAsync(
                    product.Id, selectedComponentIds);
            }

            var priceWithVat = (product.BasePrice + priceModifier) * (1 + product.VatRate / 100);
            return Math.Round(priceWithVat, 2);
        }

        public async Task<string> GenerateUniqueOrderNumberAsync()
        {
            // Usar semáforo para evitar números duplicados en creaciones simultáneas
            await _orderNumberSemaphore.WaitAsync();
            try
            {
                var today = DateTime.UtcNow;
                var datePrefix = today.ToString("yyyyMMdd");
                var baseOrderNumber = $"ORD-{datePrefix}";

                // Contar los pedidos del día
                var todayOrdersCount = await _orderRepository.CountByOrderNumberPrefixAsync(baseOrderNumber);

                var sequence = todayOrdersCount + 1;
                var orderNumber = $"{baseOrderNumber}-{sequence:D4}";

                _logger.LogDebug("Generated order number: {OrderNumber}", orderNumber);

                return orderNumber;
            }
            finally
            {
                _orderNumberSemaphore.Release();
            }
        }
    }
}
