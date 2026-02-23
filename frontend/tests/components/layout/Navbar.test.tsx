import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/Navbar";
import { useCartStore } from "@/stores/cart-store";
import { createMockCart, emptyMockCart, resetCartStore } from "../../helpers/cart";

// Isolate Navbar from MiniCart internals
vi.mock("@/components/cart/MiniCart", () => ({
  MiniCart: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? React.createElement("div", { "data-testid": "mini-cart" }, "Mini Cart") : null,
}));

// Prevent real API calls from cart store hooks
vi.mock("@/lib/api/cart", () => ({
  cartApi: { getCart: vi.fn(), addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn(), mergeCart: vi.fn() },
  ensureSessionId: vi.fn(() => "test-session"),
  getSessionId: vi.fn(() => null),
  clearSessionId: vi.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    resetCartStore();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the logo", () => {
      render(<Navbar />);

      expect(screen.getByText("SIM")).toBeInTheDocument();
      expect(screen.getByText("RACING")).toBeInTheDocument();
    });

    it("logo links to home", () => {
      render(<Navbar />);

      const logo = screen.getByText("SIM").closest("a");
      expect(logo).toHaveAttribute("href", "/");
    });

    it("renders navigation links on desktop", () => {
      render(<Navbar />);

      expect(screen.getByText("PRODUCTS")).toBeInTheDocument();
      expect(screen.getByText("WHEELS")).toBeInTheDocument();
      expect(screen.getByText("PEDALS")).toBeInTheDocument();
      expect(screen.getByText("COCKPITS")).toBeInTheDocument();
      expect(screen.getByText("ACCESSORIES")).toBeInTheDocument();
    });

    it("products link is locale-aware", () => {
      render(<Navbar />);

      const productsLink = screen.getByText("PRODUCTS").closest("a");
      expect(productsLink).toHaveAttribute("href", "/productos");
    });

    it("renders action buttons", () => {
      render(<Navbar />);

      expect(screen.getByLabelText("Search")).toBeInTheDocument();
      expect(screen.getByLabelText("Account")).toBeInTheDocument();
      expect(screen.getByLabelText("Cart")).toBeInTheDocument();
    });

    it("search button links to products page", () => {
      render(<Navbar />);

      const searchButton = screen.getByLabelText("Search");
      expect(searchButton.closest("a")).toHaveAttribute("href", "/productos");
    });

    it("account button links to login", () => {
      render(<Navbar />);

      const accountButton = screen.getByLabelText("Account");
      expect(accountButton.closest("a")).toHaveAttribute("href", "/login");
    });
  });

  describe("cart badge", () => {
    it("does not show badge when cart is empty", () => {
      useCartStore.setState({ cart: emptyMockCart() });
      render(<Navbar />);

      // Badge should not be visible
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("does not show badge when cart is null", () => {
      useCartStore.setState({ cart: null });
      render(<Navbar />);

      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("shows badge with item count when cart has items", () => {
      useCartStore.setState({ cart: createMockCart({ totalItems: 3 }) });
      render(<Navbar />);

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows 99+ when cart has more than 99 items", () => {
      useCartStore.setState({ cart: createMockCart({ totalItems: 100 }) });
      render(<Navbar />);

      expect(screen.getByText("99+")).toBeInTheDocument();
    });
  });

  describe("mini cart", () => {
    it("mini cart is closed by default", () => {
      render(<Navbar />);

      expect(screen.queryByTestId("mini-cart")).not.toBeInTheDocument();
    });

    it("opens mini cart when cart button is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      await user.click(screen.getByLabelText("Cart"));

      expect(screen.getByTestId("mini-cart")).toBeInTheDocument();
    });

    it("closes mini cart when cart button is clicked again", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      await user.click(screen.getByLabelText("Cart"));
      expect(screen.getByTestId("mini-cart")).toBeInTheDocument();

      await user.click(screen.getByLabelText("Cart"));
      expect(screen.queryByTestId("mini-cart")).not.toBeInTheDocument();
    });

    it("cart button has aria-expanded=false when closed", () => {
      render(<Navbar />);
      expect(screen.getByLabelText("Cart")).toHaveAttribute("aria-expanded", "false");
    });

    it("cart button has aria-expanded=true when open", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      await user.click(screen.getByLabelText("Cart"));

      expect(screen.getByLabelText("Cart")).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("mobile menu", () => {
    it("renders mobile menu toggle button", () => {
      render(<Navbar />);

      expect(screen.getByLabelText("Menu")).toBeInTheDocument();
    });

    it("mobile menu is hidden by default", () => {
      render(<Navbar />);

      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      expect(allProductsLinks).toHaveLength(1);
    });

    it("opens mobile menu when toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByLabelText("Menu");
      await user.click(menuButton);

      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      expect(allProductsLinks.length).toBeGreaterThan(1);
    });

    it("closes mobile menu when a link is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByLabelText("Menu");
      await user.click(menuButton);

      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      const mobileLink = allProductsLinks[1];
      await user.click(mobileLink);

      const linksAfterClose = screen.queryAllByText("PRODUCTS");
      expect(linksAfterClose).toHaveLength(1);
    });
  });

  describe("styling", () => {
    it("has sticky positioning", () => {
      render(<Navbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("sticky");
    });

    it("has correct height", () => {
      render(<Navbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("h-18");
    });
  });
});
