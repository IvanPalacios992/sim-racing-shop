using Microsoft.Extensions.Logging;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;

namespace SimRacingShop.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<CartService> _logger;

        private static readonly TimeSpan SessionCartTtl = TimeSpan.FromDays(7);
        private static readonly TimeSpan UserCartTtl = TimeSpan.FromDays(30);

        public CartService(
            ICartRepository cartRepository,
            IProductRepository productRepository,
            ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _logger = logger;
        }

        public async Task<CartDto> GetCartAsync(string cartKey, string locale)
        {
            var items = await _cartRepository.GetAllItemsAsync(cartKey);
            return await BuildCartDtoAsync(items, locale);
        }

        public async Task<CartDto> AddItemAsync(string cartKey, AddToCartDto dto, string locale)
        {
            var product = await _productRepository.GetProductByIdAsync(dto.ProductId, locale);

            if (product == null)
                throw new InvalidOperationException($"Producto {dto.ProductId} no encontrado.");

            if (!product.IsActive)
                throw new InvalidOperationException($"El producto '{product.Sku}' no está disponible.");

            var items = await _cartRepository.GetAllItemsAsync(cartKey);
            var productIdStr = dto.ProductId.ToString();

            var currentQty = items.GetValueOrDefault(productIdStr, 0);
            var newQty = currentQty + dto.Quantity;

            if (newQty > 99)
                throw new InvalidOperationException("No se pueden añadir más de 99 unidades del mismo producto.");

            var ttl = GetTtl(cartKey);
            await _cartRepository.SetItemAsync(cartKey, productIdStr, newQty, ttl);

            _logger.LogInformation("Cart {CartKey}: added {Qty} of {ProductId} (total now {NewQty})",
                cartKey, dto.Quantity, dto.ProductId, newQty);

            items[productIdStr] = newQty;
            return await BuildCartDtoAsync(items, locale);
        }

        public async Task<CartDto> UpdateItemAsync(string cartKey, Guid productId, int quantity, string locale)
        {
            var productIdStr = productId.ToString();
            var items = await _cartRepository.GetAllItemsAsync(cartKey);

            if (!items.ContainsKey(productIdStr))
                throw new KeyNotFoundException($"El producto {productId} no está en el carrito.");

            var ttl = GetTtl(cartKey);
            await _cartRepository.SetItemAsync(cartKey, productIdStr, quantity, ttl);

            _logger.LogInformation("Cart {CartKey}: updated product {ProductId} to qty {Quantity}",
                cartKey, productId, quantity);

            items[productIdStr] = quantity;
            return await BuildCartDtoAsync(items, locale);
        }

        public async Task RemoveItemAsync(string cartKey, Guid productId)
        {
            await _cartRepository.RemoveItemAsync(cartKey, productId.ToString());
            _logger.LogInformation("Cart {CartKey}: removed product {ProductId}", cartKey, productId);
        }

        public async Task ClearCartAsync(string cartKey)
        {
            await _cartRepository.DeleteCartAsync(cartKey);
            _logger.LogInformation("Cart {CartKey}: cleared", cartKey);
        }

        public async Task<CartDto> MergeCartsAsync(string sessionKey, string userKey, string locale)
        {
            await _cartRepository.MergeAsync(sessionKey, userKey, UserCartTtl);
            _logger.LogInformation("Merged session cart {SessionKey} into user cart {UserKey}", sessionKey, userKey);
            return await GetCartAsync(userKey, locale);
        }

        // --- Helpers ---

        private static TimeSpan GetTtl(string cartKey) =>
            cartKey.StartsWith("cart:user:") ? UserCartTtl : SessionCartTtl;

        private async Task<CartDto> BuildCartDtoAsync(Dictionary<string, int> items, string locale)
        {
            if (items.Count == 0)
                return new CartDto();

            var cartItems = new List<CartItemDto>(items.Count);

            foreach (var (productIdStr, quantity) in items)
            {
                if (!Guid.TryParse(productIdStr, out var productId) || quantity <= 0)
                    continue;

                var product = await _productRepository.GetProductByIdAsync(productId, locale);
                if (product == null || !product.IsActive)
                {
                    _logger.LogWarning("Cart build: product {ProductId} not found or inactive, skipping", productId);
                    continue;
                }

                var subtotal = Math.Round(product.BasePrice * quantity, 2);
                var imageUrl = product.Images.FirstOrDefault()?.ImageUrl;

                cartItems.Add(new CartItemDto
                {
                    ProductId = productId,
                    Sku = product.Sku,
                    Name = product.Name,
                    ImageUrl = imageUrl,
                    Quantity = quantity,
                    UnitPrice = product.BasePrice,
                    VatRate = product.VatRate,
                    Subtotal = subtotal,
                });
            }

            var subtotalTotal = cartItems.Sum(i => i.Subtotal);
            // Cada producto puede tener su propio tipo de IVA
            var vatAmount = Math.Round(cartItems.Sum(i => i.Subtotal * i.VatRate / 100m), 2);

            return new CartDto
            {
                Items = cartItems.AsReadOnly(),
                TotalItems = cartItems.Sum(i => i.Quantity),
                Subtotal = subtotalTotal,
                VatAmount = vatAmount,
                Total = Math.Round(subtotalTotal + vatAmount, 2),
            };
        }
    }
}
