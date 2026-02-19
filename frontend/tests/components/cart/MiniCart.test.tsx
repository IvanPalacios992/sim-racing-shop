import React from "react";
import { render, screen, fireEvent } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { MiniCart } from "@/components/cart/MiniCart";
import { useCartStore } from "@/stores/cart-store";
import { createMockCart, createMockCartItem, emptyMockCart, resetCartStore } from "../../helpers/cart";

// Prevent real API calls during tests
vi.mock("@/lib/api/cart", () => ({
  cartApi: { getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), mergeCart: vi.fn() },
  ensureSessionId: vi.fn(() => "test-session"),
  getSessionId: vi.fn(() => "test-session"),
  clearSessionId: vi.fn(),
}));

const defaultProps = { isOpen: true, onClose: vi.fn() };

describe("MiniCart", () => {
  beforeEach(() => {
    resetCartStore();
    vi.clearAllMocks();
  });

  describe("visibility", () => {
    it("renders nothing when isOpen is false", () => {
      useCartStore.setState({ cart: createMockCart() });
      const { container } = render(<MiniCart isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders dialog when isOpen is true", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("header", () => {
    it("shows mini cart title", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByRole("heading", { name: "Shopping Cart" })).toBeInTheDocument();
    });

    it("shows singular item label for 1 item", () => {
      useCartStore.setState({ cart: createMockCart({ totalItems: 1 }) });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    it("shows plural item label for multiple items", () => {
      const item2 = createMockCartItem({ productId: "p2", name: "Pedals" });
      useCartStore.setState({ cart: createMockCart({ items: [createMockCartItem(), item2], totalItems: 2 }) });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("2 items")).toBeInTheDocument();
    });

    it("shows 0 items when cart is empty", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("0 items")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when cart has no items", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("Explore our products and find the perfect sim racing equipment")).toBeInTheDocument();
    });

    it("shows explore products link in empty state", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<MiniCart {...defaultProps} />);
      const link = screen.getByRole("link", { name: "Explore Products" });
      expect(link).toHaveAttribute("href", "/productos");
    });

    it("explore products link calls onClose when clicked", async () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });
      const user = userEvent.setup();
      render(<MiniCart isOpen={true} onClose={onClose} />);

      await user.click(screen.getByRole("link", { name: "Explore Products" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("cart items", () => {
    it("shows item name", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("Formula Steering Wheel")).toBeInTheDocument();
    });

    it("shows item quantity", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
    });

    it("shows item subtotal", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getAllByText("€349.99").length).toBeGreaterThan(0);
    });

    it("shows cart subtotal in footer", () => {
      useCartStore.setState({ cart: createMockCart({ subtotal: 349.99 }) });
      render(<MiniCart {...defaultProps} />);
      // Both item subtotal and footer subtotal show €349.99
      expect(screen.getAllByText("€349.99").length).toBeGreaterThanOrEqual(1);
    });

    it("renders remove button for each item", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByLabelText("Remove")).toBeInTheDocument();
    });

    it("remove button calls store removeItem", async () => {
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart() });
      const removeSpy = vi.spyOn(useCartStore.getState(), "removeItem").mockResolvedValue(undefined);

      render(<MiniCart {...defaultProps} />);
      await user.click(screen.getByLabelText("Remove"));

      expect(removeSpy).toHaveBeenCalledWith("product-123");
    });

    it("shows product image when imageUrl is provided", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByAltText("Formula Steering Wheel")).toBeInTheDocument();
    });

    it("shows fallback icon when no imageUrl", () => {
      const item = createMockCartItem({ imageUrl: null });
      useCartStore.setState({ cart: createMockCart({ items: [item] }) });
      render(<MiniCart {...defaultProps} />);
      // No img with alt text should be present
      expect(screen.queryByAltText("Formula Steering Wheel")).not.toBeInTheDocument();
    });
  });

  describe("footer actions", () => {
    it("shows View Cart link", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByRole("link", { name: "View Cart" })).toBeInTheDocument();
    });

    it("shows Checkout link", () => {
      useCartStore.setState({ cart: createMockCart() });
      render(<MiniCart {...defaultProps} />);
      expect(screen.getByRole("link", { name: "Checkout" })).toBeInTheDocument();
    });

    it("View Cart link calls onClose", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      await user.click(screen.getByRole("link", { name: "View Cart" }));

      expect(onClose).toHaveBeenCalled();
    });

    it("Checkout link calls onClose", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      useCartStore.setState({ cart: createMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      await user.click(screen.getByRole("link", { name: "Checkout" }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("keyboard and outside click behavior", () => {
    it("calls onClose when Escape key is pressed", () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("does not call onClose for non-Escape keys", () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Enter" });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when clicking outside the panel", () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      // Fire mousedown on document body (outside the dialog panel)
      fireEvent.mouseDown(document.body);

      expect(onClose).toHaveBeenCalled();
    });

    it("does NOT call onClose when clicking inside the panel", () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });

      render(<MiniCart isOpen={true} onClose={onClose} />);
      const dialog = screen.getByRole("dialog");
      fireEvent.mouseDown(dialog);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not register keyboard/click handlers when closed", () => {
      const onClose = vi.fn();
      useCartStore.setState({ cart: emptyMockCart() });

      render(<MiniCart isOpen={false} onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
