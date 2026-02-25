import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartDto, CartItemDto, SelectedOption } from "@/types/cart";
import {
  cartApi,
  ensureSessionId,
  getSessionId,
  clearSessionId,
} from "@/lib/api/cart";

interface CartState {
  cart: CartDto | null;
  isLoading: boolean;
  error: string | null;
  /** Name of the last item added – used to show a toast. Cleared after display. */
  lastAddedItem: string | null;
  _hasHydrated: boolean;
}

interface CartActions {
  /** Ensures a session ID exists for anonymous carts. Call on app mount. */
  initSession: () => string;
  fetchCart: (locale?: string) => Promise<void>;
  addItem: (productId: string, quantity?: number, locale?: string, selectedComponentIds?: string[], selectedOptions?: SelectedOption[]) => Promise<void>;
  updateItem: (productId: string, quantity: number, locale?: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Merges session cart into user cart. Call after successful login. */
  mergeCart: (sessionId: string, locale?: string) => Promise<void>;
  clearNotification: () => void;
  reset: () => void;
}

type CartStore = CartState & CartActions;

const EMPTY_CART: CartDto = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  vatAmount: 0,
  total: 0,
};

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  lastAddedItem: null,
  _hasHydrated: false,
};

/** Recalculate totals client-side for optimistic updates */
function recalcCart(items: CartItemDto[]): CartDto {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const vatAmount = Math.round(items.reduce((sum, i) => sum + (i.subtotal * i.vatRate) / 100, 0) * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { items, totalItems, subtotal, vatAmount, total };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: () => ensureSessionId(),

      fetchCart: async (locale = "es") => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.getCart(locale);
          set({ cart, isLoading: false });
        } catch {
          set({ isLoading: false, error: "Error loading cart" });
        }
      },

      addItem: async (productId, quantity = 1, locale = "es", selectedComponentIds, selectedOptions) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.addItem(
            { productId, quantity, selectedComponentIds, selectedOptions },
            locale,
          );
          const addedName = cart.items.find((i) => i.productId === productId)?.name ?? null;
          set({ cart, isLoading: false, lastAddedItem: addedName });
        } catch (err) {
          set({ isLoading: false, error: "Error adding item" });
          throw err;
        }
      },

      updateItem: async (productId, quantity, locale = "es") => {
        const previous = get().cart;

        // Optimistic update: recalculate totals locally
        if (previous) {
          const updatedItems = previous.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity, subtotal: Math.round(i.unitPrice * quantity * 100) / 100 }
              : i
          );
          set({ cart: recalcCart(updatedItems) });
        }

        try {
          const cart = await cartApi.updateItem(productId, { quantity }, locale);
          set({ cart });
        } catch {
          set({ cart: previous, error: "Error updating item" });
        }
      },

      removeItem: async (productId) => {
        const previous = get().cart;

        // Optimistic update
        if (previous) {
          const updatedItems = previous.items.filter((i) => i.productId !== productId);
          set({ cart: recalcCart(updatedItems) });
        }

        try {
          await cartApi.removeItem(productId);
        } catch {
          set({ cart: previous, error: "Error removing item" });
        }
      },

      clearCart: async () => {
        const previous = get().cart;
        set({ cart: EMPTY_CART });
        try {
          await cartApi.clearCart();
        } catch {
          set({ cart: previous });
        }
      },

      mergeCart: async (sessionId, locale = "es") => {
        try {
          const cart = await cartApi.mergeCart({ sessionId }, locale);
          set({ cart });
          clearSessionId();
        } catch {
          // Merge failure is non-fatal; cart state remains unchanged
        }
      },

      clearNotification: () => set({ lastAddedItem: null }),

      reset: () => {
        set({ ...initialState, _hasHydrated: true });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cart: state.cart,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state._hasHydrated = true;
      },
    }
  )
);

// Selector hooks
export const useCart = () => useCartStore((state) => state.cart);
export const useCartItemCount = () => useCartStore((state) => state.cart?.totalItems ?? 0);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
