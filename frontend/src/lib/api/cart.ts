import { apiClient } from "@/lib/api-client";
import type { CartDto, AddToCartDto, UpdateCartItemDto, MergeCartDto } from "@/types/cart";

const SESSION_ID_KEY = "cart-session-id";

// Session ID management for anonymous cart

export const getSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_ID_KEY);
};

export const setSessionId = (id: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_ID_KEY, id);
};

export const clearSessionId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_ID_KEY);
};

export const ensureSessionId = (): string => {
  const existing = getSessionId();
  if (existing) return existing;
  const newId = crypto.randomUUID();
  setSessionId(newId);
  return newId;
};

// Ensures an anonymous session ID exists and returns it as header.
// Ignored by the backend when the user is authenticated.
const sessionHeaders = () => {
  const sessionId = ensureSessionId();
  return { "X-Cart-Session": sessionId };
};

export const cartApi = {
  async getCart(locale = "es"): Promise<CartDto> {
    const response = await apiClient.get<CartDto>("/cart", {
      params: { locale },
      headers: sessionHeaders(),
    });
    return response.data;
  },

  async addItem(dto: AddToCartDto, locale = "es"): Promise<CartDto> {
    const response = await apiClient.post<CartDto>("/cart/items", dto, {
      params: { locale },
      headers: sessionHeaders(),
    });
    return response.data;
  },

  async updateItem(productId: string, dto: UpdateCartItemDto, locale = "es"): Promise<CartDto> {
    const response = await apiClient.put<CartDto>(`/cart/items/${productId}`, dto, {
      params: { locale },
      headers: sessionHeaders(),
    });
    return response.data;
  },

  async removeItem(productId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${productId}`, {
      headers: sessionHeaders(),
    });
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/cart", {
      headers: sessionHeaders(),
    });
  },

  async mergeCart(dto: MergeCartDto, locale = "es"): Promise<CartDto> {
    const response = await apiClient.post<CartDto>("/cart/merge", dto, {
      params: { locale },
    });
    return response.data;
  },
};
