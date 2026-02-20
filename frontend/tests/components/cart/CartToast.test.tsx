import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { CartToast } from "@/components/cart/CartToast";
import { useCartStore } from "@/stores/cart-store";
import { resetCartStore } from "../../helpers/cart";

vi.mock("@/lib/api/cart", () => ({
  cartApi: { getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), mergeCart: vi.fn() },
  ensureSessionId: vi.fn(() => "test-session"),
  getSessionId: vi.fn(() => null),
  clearSessionId: vi.fn(),
}));

describe("CartToast", () => {
  beforeEach(() => {
    resetCartStore();
    vi.clearAllMocks();
  });

  describe("visibility", () => {
    it("renders nothing when lastAddedItem is null", () => {
      const { container } = render(<CartToast />);
      expect(container.firstChild).toBeNull();
    });

    it("shows toast when lastAddedItem is set", () => {
      useCartStore.setState({ lastAddedItem: "Formula Steering Wheel" });
      render(<CartToast />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("shows the product name in the toast", () => {
      useCartStore.setState({ lastAddedItem: "Sprint Pedal Set" });
      render(<CartToast />);
      expect(screen.getByText("Sprint Pedal Set")).toBeInTheDocument();
    });

    it("shows 'added to cart' message", () => {
      useCartStore.setState({ lastAddedItem: "Some Product" });
      render(<CartToast />);
      expect(screen.getByText("added to cart")).toBeInTheDocument();
    });
  });

  describe("dismiss behavior", () => {
    it("close button clears the notification", async () => {
      const user = userEvent.setup();
      useCartStore.setState({ lastAddedItem: "Pedals" });
      render(<CartToast />);

      await user.click(screen.getByRole("button", { name: "Cerrar" }));

      expect(useCartStore.getState().lastAddedItem).toBeNull();
    });

    it("auto-dismisses after 3500ms", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      useCartStore.setState({ lastAddedItem: "Cockpit" });
      render(<CartToast />);

      expect(screen.getByRole("status")).toBeInTheDocument();

      await vi.advanceTimersByTimeAsync(3500);

      expect(useCartStore.getState().lastAddedItem).toBeNull();

      vi.useRealTimers();
    });

    it("resets auto-dismiss timer when a new item is added", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      useCartStore.setState({ lastAddedItem: "Product A" });
      render(<CartToast />);

      // Advance partially then change item
      await vi.advanceTimersByTimeAsync(2000);
      useCartStore.setState({ lastAddedItem: "Product B" });

      // Full 3500ms from new item
      await vi.advanceTimersByTimeAsync(3500);
      expect(useCartStore.getState().lastAddedItem).toBeNull();

      vi.useRealTimers();
    });
  });

  describe("accessibility", () => {
    it("has role=status for screen readers", () => {
      useCartStore.setState({ lastAddedItem: "Wheel" });
      render(<CartToast />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });
  });
});
