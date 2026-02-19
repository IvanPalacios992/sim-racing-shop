import { useCartStore } from "@/stores/cart-store";
import type { CartItemDto, CartDto } from "@/types/cart";

export function createMockCartItem(overrides?: Partial<CartItemDto>): CartItemDto {
  return {
    productId: "product-123",
    sku: "WHL-001",
    name: "Formula Steering Wheel",
    imageUrl: "https://example.com/product.jpg",
    quantity: 1,
    unitPrice: 349.99,
    vatRate: 21,
    subtotal: 349.99,
    ...overrides,
  };
}

export function createMockCart(overrides?: Partial<CartDto>): CartDto {
  const item = createMockCartItem();
  return {
    items: [item],
    totalItems: 1,
    subtotal: 349.99,
    vatAmount: 73.50,
    total: 423.49,
    ...overrides,
  };
}

export function emptyMockCart(): CartDto {
  return {
    items: [],
    totalItems: 0,
    subtotal: 0,
    vatAmount: 0,
    total: 0,
  };
}

export function resetCartStore() {
  useCartStore.getState().reset();
}
