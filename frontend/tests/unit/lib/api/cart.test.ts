import { cartApi, getSessionId, setSessionId, clearSessionId, ensureSessionId } from "@/lib/api/cart";
import { apiClient } from "@/lib/api-client";
import { createMockCart, emptyMockCart } from "../../../helpers/cart";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const SESSION_KEY = "cart-session-id";

describe("cart session ID helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getSessionId", () => {
    it("returns null when no session ID is stored", () => {
      expect(getSessionId()).toBeNull();
    });

    it("returns the stored session ID", () => {
      localStorage.setItem(SESSION_KEY, "my-session-id");
      expect(getSessionId()).toBe("my-session-id");
    });
  });

  describe("setSessionId", () => {
    it("stores the session ID in localStorage", () => {
      setSessionId("new-session");
      expect(localStorage.getItem(SESSION_KEY)).toBe("new-session");
    });
  });

  describe("clearSessionId", () => {
    it("removes the session ID from localStorage", () => {
      localStorage.setItem(SESSION_KEY, "existing-session");
      clearSessionId();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe("ensureSessionId", () => {
    it("returns existing session ID if present", () => {
      localStorage.setItem(SESSION_KEY, "existing-id");
      const result = ensureSessionId();
      expect(result).toBe("existing-id");
    });

    it("creates and stores a new UUID if no session ID exists", () => {
      const result = ensureSessionId();
      expect(result).toBeTruthy();
      expect(localStorage.getItem(SESSION_KEY)).toBe(result);
    });

    it("does not overwrite an existing session ID", () => {
      localStorage.setItem(SESSION_KEY, "keep-me");
      ensureSessionId();
      expect(localStorage.getItem(SESSION_KEY)).toBe("keep-me");
    });
  });
});

describe("cartApi", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getCart", () => {
    it("calls GET /cart with locale param", async () => {
      const mockCart = createMockCart();
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCart });

      const result = await cartApi.getCart("es");

      expect(apiClient.get).toHaveBeenCalledWith("/cart", expect.objectContaining({ params: { locale: "es" } }));
      expect(result).toEqual(mockCart);
    });

    it("includes X-Cart-Session header when session ID exists", async () => {
      localStorage.setItem(SESSION_KEY, "test-session");
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyMockCart() });

      await cartApi.getCart();

      expect(apiClient.get).toHaveBeenCalledWith(
        "/cart",
        expect.objectContaining({ headers: { "X-Cart-Session": "test-session" } })
      );
    });

    it("crea y envía X-Cart-Session cuando no hay sesión previa", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyMockCart() });

      await cartApi.getCart();

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      const header = (opts as { headers: Record<string, string> }).headers["X-Cart-Session"];
      expect(header).toBeTruthy();
      // El ID generado debe haberse guardado en localStorage
      expect(localStorage.getItem(SESSION_KEY)).toBe(header);
    });

    it("defaults locale to es", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyMockCart() });

      await cartApi.getCart();

      expect(apiClient.get).toHaveBeenCalledWith("/cart", expect.objectContaining({ params: { locale: "es" } }));
    });
  });

  describe("addItem", () => {
    it("calls POST /cart/items with dto and locale", async () => {
      const mockCart = createMockCart();
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCart });

      const result = await cartApi.addItem({ productId: "prod-1", quantity: 2 }, "en");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/cart/items",
        { productId: "prod-1", quantity: 2 },
        expect.objectContaining({ params: { locale: "en" } })
      );
      expect(result).toEqual(mockCart);
    });

    it("includes session header when session exists", async () => {
      localStorage.setItem(SESSION_KEY, "s-123");
      vi.mocked(apiClient.post).mockResolvedValue({ data: emptyMockCart() });

      await cartApi.addItem({ productId: "p", quantity: 1 });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/cart/items",
        expect.anything(),
        expect.objectContaining({ headers: { "X-Cart-Session": "s-123" } })
      );
    });
  });

  describe("updateItem", () => {
    it("calls PUT /cart/items/{productId} with quantity", async () => {
      const mockCart = createMockCart();
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCart });

      await cartApi.updateItem("product-123", { quantity: 3 }, "es");

      expect(apiClient.put).toHaveBeenCalledWith(
        "/cart/items/product-123",
        { quantity: 3 },
        expect.objectContaining({ params: { locale: "es" } })
      );
    });
  });

  describe("removeItem", () => {
    it("calls DELETE /cart/items/{productId}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await cartApi.removeItem("product-123");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/cart/items/product-123",
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });
  });

  describe("clearCart", () => {
    it("calls DELETE /cart", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await cartApi.clearCart();

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/cart",
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });
  });

  describe("mergeCart", () => {
    it("calls POST /cart/merge with sessionId", async () => {
      const mockCart = createMockCart();
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCart });

      const result = await cartApi.mergeCart({ sessionId: "sess-abc" }, "es");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/cart/merge",
        { sessionId: "sess-abc" },
        expect.objectContaining({ params: { locale: "es" } })
      );
      expect(result).toEqual(mockCart);
    });

    it("does NOT include session header in merge request", async () => {
      localStorage.setItem(SESSION_KEY, "s-123");
      vi.mocked(apiClient.post).mockResolvedValue({ data: emptyMockCart() });

      await cartApi.mergeCart({ sessionId: "s-123" });

      // mergeCart sends the sessionId in the body, not as a header
      expect(apiClient.post).toHaveBeenCalledWith(
        "/cart/merge",
        { sessionId: "s-123" },
        expect.not.objectContaining({ headers: { "X-Cart-Session": expect.anything() } })
      );
    });
  });
});
