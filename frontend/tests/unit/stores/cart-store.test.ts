import { useCartStore } from "@/stores/cart-store";
import { cartApi, clearSessionId } from "@/lib/api/cart";
import { createMockCart, createMockCartItem, emptyMockCart, resetCartStore } from "../../helpers/cart";

vi.mock("@/lib/api/cart", () => ({
  cartApi: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    mergeCart: vi.fn(),
  },
  ensureSessionId: vi.fn(() => "test-session-id"),
  getSessionId: vi.fn(() => "test-session-id"),
  clearSessionId: vi.fn(),
}));

describe("cart-store", () => {
  beforeEach(() => {
    resetCartStore();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with null cart", () => {
      expect(useCartStore.getState().cart).toBeNull();
    });

    it("starts with isLoading false", () => {
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it("starts with no lastAddedItem", () => {
      expect(useCartStore.getState().lastAddedItem).toBeNull();
    });

    it("has _hasHydrated true after reset", () => {
      expect(useCartStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe("initSession", () => {
    it("returns a session ID", () => {
      const id = useCartStore.getState().initSession();
      expect(id).toBe("test-session-id");
    });
  });

  describe("fetchCart", () => {
    it("sets cart on success", async () => {
      const mockCart = createMockCart();
      vi.mocked(cartApi.getCart).mockResolvedValue(mockCart);

      await useCartStore.getState().fetchCart("es");

      expect(useCartStore.getState().cart).toEqual(mockCart);
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it("sets isLoading true during fetch", async () => {
      let resolvePromise!: (value: ReturnType<typeof createMockCart>) => void;
      vi.mocked(cartApi.getCart).mockReturnValue(
        new Promise((res) => { resolvePromise = res; })
      );

      const fetchPromise = useCartStore.getState().fetchCart("es");
      expect(useCartStore.getState().isLoading).toBe(true);

      resolvePromise(createMockCart());
      await fetchPromise;
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it("sets error and stops loading on failure", async () => {
      vi.mocked(cartApi.getCart).mockRejectedValue(new Error("Network error"));

      await useCartStore.getState().fetchCart("es");

      expect(useCartStore.getState().isLoading).toBe(false);
      expect(useCartStore.getState().error).toBe("Error loading cart");
    });
  });

  describe("addItem", () => {
    it("updates cart and sets lastAddedItem on success", async () => {
      const item = createMockCartItem({ productId: "prod-1", name: "Pedal Set" });
      const cart = createMockCart({ items: [item], totalItems: 1 });
      vi.mocked(cartApi.addItem).mockResolvedValue(cart);

      await useCartStore.getState().addItem("prod-1", 1, "es");

      expect(useCartStore.getState().cart).toEqual(cart);
      expect(useCartStore.getState().lastAddedItem).toBe("Pedal Set");
      expect(useCartStore.getState().isLoading).toBe(false);
    });

    it("calls cartApi.addItem with correct dto", async () => {
      vi.mocked(cartApi.addItem).mockResolvedValue(createMockCart());

      await useCartStore.getState().addItem("prod-1", 3, "en");

      expect(cartApi.addItem).toHaveBeenCalledWith({ productId: "prod-1", quantity: 3 }, "en");
    });

    it("throws and sets error on failure", async () => {
      vi.mocked(cartApi.addItem).mockRejectedValue(new Error("Not found"));

      await expect(useCartStore.getState().addItem("bad-id", 1)).rejects.toThrow();
      expect(useCartStore.getState().error).toBe("Error adding item");
    });
  });

  describe("updateItem", () => {
    it("applies optimistic update immediately", async () => {
      const initialItem = createMockCartItem({ productId: "p1", quantity: 1, unitPrice: 100, subtotal: 100 });
      const initialCart = createMockCart({ items: [initialItem], totalItems: 1, subtotal: 100 });
      useCartStore.setState({ cart: initialCart });

      vi.mocked(cartApi.updateItem).mockReturnValue(new Promise(() => {})); // never resolves

      useCartStore.getState().updateItem("p1", 3, "es");

      const optimisticItem = useCartStore.getState().cart?.items.find((i) => i.productId === "p1");
      expect(optimisticItem?.quantity).toBe(3);
    });

    it("replaces optimistic state with server response on success", async () => {
      const serverCart = createMockCart({ totalItems: 3 });
      vi.mocked(cartApi.updateItem).mockResolvedValue(serverCart);

      useCartStore.setState({ cart: createMockCart() });
      await useCartStore.getState().updateItem("product-123", 3, "es");

      expect(useCartStore.getState().cart).toEqual(serverCart);
    });

    it("rolls back optimistic update on failure", async () => {
      const originalCart = createMockCart({ totalItems: 1 });
      useCartStore.setState({ cart: originalCart });
      vi.mocked(cartApi.updateItem).mockRejectedValue(new Error("Server error"));

      await useCartStore.getState().updateItem("product-123", 5, "es");

      expect(useCartStore.getState().cart).toEqual(originalCart);
    });
  });

  describe("removeItem", () => {
    it("removes item optimistically from cart", async () => {
      const item1 = createMockCartItem({ productId: "p1" });
      const item2 = createMockCartItem({ productId: "p2", name: "Pedal Set", subtotal: 799 });
      const cart = createMockCart({ items: [item1, item2], totalItems: 2 });
      useCartStore.setState({ cart });

      vi.mocked(cartApi.removeItem).mockResolvedValue(undefined);

      await useCartStore.getState().removeItem("p1");

      const remaining = useCartStore.getState().cart?.items;
      expect(remaining).toHaveLength(1);
      expect(remaining?.[0].productId).toBe("p2");
    });

    it("rolls back on API failure", async () => {
      const originalCart = createMockCart();
      useCartStore.setState({ cart: originalCart });
      vi.mocked(cartApi.removeItem).mockRejectedValue(new Error("Server error"));

      await useCartStore.getState().removeItem("product-123");

      expect(useCartStore.getState().cart).toEqual(originalCart);
    });

    it("calls cartApi.removeItem with productId", async () => {
      useCartStore.setState({ cart: createMockCart() });
      vi.mocked(cartApi.removeItem).mockResolvedValue(undefined);

      await useCartStore.getState().removeItem("product-123");

      expect(cartApi.removeItem).toHaveBeenCalledWith("product-123");
    });
  });

  describe("clearCart", () => {
    it("sets cart to empty state immediately", async () => {
      useCartStore.setState({ cart: createMockCart() });
      vi.mocked(cartApi.clearCart).mockResolvedValue(undefined);

      await useCartStore.getState().clearCart();

      expect(useCartStore.getState().cart?.items).toHaveLength(0);
      expect(useCartStore.getState().cart?.totalItems).toBe(0);
    });

    it("rolls back on API failure", async () => {
      const originalCart = createMockCart();
      useCartStore.setState({ cart: originalCart });
      vi.mocked(cartApi.clearCart).mockRejectedValue(new Error("Server error"));

      await useCartStore.getState().clearCart();

      expect(useCartStore.getState().cart).toEqual(originalCart);
    });
  });

  describe("mergeCart", () => {
    it("updates cart and clears session ID on success", async () => {
      const mergedCart = createMockCart({ totalItems: 3 });
      vi.mocked(cartApi.mergeCart).mockResolvedValue(mergedCart);

      await useCartStore.getState().mergeCart("session-abc", "es");

      expect(useCartStore.getState().cart).toEqual(mergedCart);
      expect(clearSessionId).toHaveBeenCalled();
    });

    it("calls cartApi.mergeCart with correct sessionId", async () => {
      vi.mocked(cartApi.mergeCart).mockResolvedValue(createMockCart());

      await useCartStore.getState().mergeCart("sess-xyz", "en");

      expect(cartApi.mergeCart).toHaveBeenCalledWith({ sessionId: "sess-xyz" }, "en");
    });

    it("does not throw on API failure (non-fatal)", async () => {
      vi.mocked(cartApi.mergeCart).mockRejectedValue(new Error("Merge failed"));

      await expect(useCartStore.getState().mergeCart("s", "es")).resolves.toBeUndefined();
    });
  });

  describe("clearNotification", () => {
    it("clears lastAddedItem", () => {
      useCartStore.setState({ lastAddedItem: "Some Product" });

      useCartStore.getState().clearNotification();

      expect(useCartStore.getState().lastAddedItem).toBeNull();
    });
  });

  describe("recalcCart (optimistic update accuracy)", () => {
    it("recalculates totalItems correctly after remove", async () => {
      const item1 = createMockCartItem({ productId: "p1", quantity: 2, subtotal: 200 });
      const item2 = createMockCartItem({ productId: "p2", quantity: 1, subtotal: 100 });
      useCartStore.setState({ cart: { items: [item1, item2], totalItems: 3, subtotal: 300, vatAmount: 63, total: 363 } });
      vi.mocked(cartApi.removeItem).mockResolvedValue(undefined);

      await useCartStore.getState().removeItem("p1");

      expect(useCartStore.getState().cart?.totalItems).toBe(1);
      expect(useCartStore.getState().cart?.subtotal).toBe(100);
    });
  });
});
