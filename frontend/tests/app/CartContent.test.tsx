import React from "react";
import { render, screen, waitFor } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import CartContent from "@/app/[locale]/carrito/CartContent";
import { useCartStore } from "@/stores/cart-store";
import { cartApi } from "@/lib/api/cart";
import { createMockCart, createMockCartItem, emptyMockCart, resetCartStore } from "../helpers/cart";

vi.mock("@/lib/api/cart", () => ({
  cartApi: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    mergeCart: vi.fn(),
  },
  ensureSessionId: vi.fn(() => "test-session"),
  getSessionId: vi.fn(() => null),
  clearSessionId: vi.fn(),
}));

describe("CartContent", () => {
  beforeEach(() => {
    resetCartStore();
    vi.clearAllMocks();
    // Default: API returns an empty cart so fetchCart doesn't fail
    vi.mocked(cartApi.getCart).mockResolvedValue(emptyMockCart());
  });

  describe("page structure", () => {
    it("renders page title", async () => {
      render(<CartContent />);
      expect(screen.getByRole("heading", { level: 1, name: "Shopping Cart" })).toBeInTheDocument();
    });

    it("renders breadcrumb with home and cart links", () => {
      render(<CartContent />);
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
      // Breadcrumb "Shopping Cart" text is in a span, not just the h1
      expect(screen.getAllByText("Shopping Cart").length).toBeGreaterThan(0);
    });
  });

  describe("loading state", () => {
    it("shows skeleton while loading", () => {
      // Set loading=true and no items so skeleton shows
      useCartStore.setState({ isLoading: true, cart: null, _hasHydrated: false });

      const { container } = render(<CartContent />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("empty cart", () => {
    it("shows empty state when cart has no items", () => {
      useCartStore.setState({ cart: emptyMockCart(), isLoading: false, _hasHydrated: false });
      render(<CartContent />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    it("shows empty cart message", () => {
      useCartStore.setState({ cart: emptyMockCart(), isLoading: false, _hasHydrated: false });
      render(<CartContent />);
      expect(screen.getByText("Explore our products and find the perfect sim racing equipment")).toBeInTheDocument();
    });

    it("shows explore products link in empty state", () => {
      useCartStore.setState({ cart: emptyMockCart(), isLoading: false, _hasHydrated: false });
      render(<CartContent />);
      const link = screen.getByRole("link", { name: "Explore Products" });
      expect(link).toHaveAttribute("href", "/productos");
    });

    it("shows empty state when cart is null and not loading", () => {
      useCartStore.setState({ cart: null, isLoading: false, _hasHydrated: false });
      render(<CartContent />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });
  });

  describe("cart with items", () => {
    beforeEach(() => {
      useCartStore.setState({ cart: createMockCart(), isLoading: false, _hasHydrated: false });
    });

    it("shows items count heading", () => {
      render(<CartContent />);
      expect(screen.getByRole("heading", { level: 2, name: "1 items" })).toBeInTheDocument();
    });

    it("renders cart item name", () => {
      render(<CartContent />);
      expect(screen.getByText("Formula Steering Wheel")).toBeInTheDocument();
    });

    it("renders cart item SKU", () => {
      render(<CartContent />);
      expect(screen.getByText("WHL-001")).toBeInTheDocument();
    });

    it("renders order summary section", () => {
      render(<CartContent />);
      expect(screen.getByRole("complementary")).toBeInTheDocument(); // aside
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("shows subtotal in summary", () => {
      render(<CartContent />);
      expect(screen.getAllByText("€349.99").length).toBeGreaterThan(0);
    });
  });

  describe("clear cart", () => {
    it("shows clear cart button when cart has items", () => {
      useCartStore.setState({ cart: createMockCart(), isLoading: false, _hasHydrated: false });
      render(<CartContent />);
      expect(screen.getByRole("button", { name: /clear cart/i })).toBeInTheDocument();
    });

    it("calls clearCart when clear cart button is clicked", async () => {
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart(), isLoading: false, _hasHydrated: false });
      vi.mocked(cartApi.clearCart).mockResolvedValue(undefined);

      render(<CartContent />);
      await user.click(screen.getByRole("button", { name: /clear cart/i }));

      expect(cartApi.clearCart).toHaveBeenCalled();
    });
  });

  describe("item quantity update", () => {
    it("calls updateItem when quantity is increased", async () => {
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart(), isLoading: false, _hasHydrated: false });
      vi.mocked(cartApi.updateItem).mockResolvedValue(createMockCart());

      render(<CartContent />);
      await user.click(screen.getByLabelText("Increase quantity"));

      expect(cartApi.updateItem).toHaveBeenCalledWith(
        "product-123",
        { quantity: 2 },
        expect.any(String)
      );
    });

    it("calls updateItem when quantity is decreased (min 1)", async () => {
      const user = userEvent.setup();
      const item = createMockCartItem({ quantity: 3, subtotal: 1050 });
      useCartStore.setState({ cart: createMockCart({ items: [item] }), isLoading: false, _hasHydrated: false });
      vi.mocked(cartApi.updateItem).mockResolvedValue(createMockCart());

      render(<CartContent />);
      await user.click(screen.getByLabelText("Decrease quantity"));

      expect(cartApi.updateItem).toHaveBeenCalledWith(
        "product-123",
        { quantity: 2 },
        expect.any(String)
      );
    });
  });

  describe("item removal", () => {
    it("calls removeItem when remove button is clicked", async () => {
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart(), isLoading: false, _hasHydrated: false });
      vi.mocked(cartApi.removeItem).mockResolvedValue(undefined);

      render(<CartContent />);
      await user.click(screen.getByRole("button", { name: /remove/i }));

      expect(cartApi.removeItem).toHaveBeenCalledWith("product-123");
    });
  });

  describe("fetchCart on mount", () => {
    it("calls fetchCart when _hasHydrated is true", async () => {
      const mockCart = createMockCart();
      vi.mocked(cartApi.getCart).mockResolvedValue(mockCart);
      // After reset(), _hasHydrated is true
      resetCartStore();

      render(<CartContent />);

      await waitFor(() => {
        expect(cartApi.getCart).toHaveBeenCalled();
      });
    });

    it("does not call fetchCart when _hasHydrated is false", () => {
      useCartStore.setState({ _hasHydrated: false });

      render(<CartContent />);

      expect(cartApi.getCart).not.toHaveBeenCalled();
    });

    it("shows cart items received from API after fetch", async () => {
      const cartFromApi = createMockCart({ items: [createMockCartItem({ name: "GT1 Cockpit" })] });
      vi.mocked(cartApi.getCart).mockResolvedValue(cartFromApi);
      resetCartStore(); // _hasHydrated: true, cart: null

      render(<CartContent />);

      await waitFor(() => {
        expect(screen.getByText("GT1 Cockpit")).toBeInTheDocument();
      });
    });
  });
});
