import React from "react";
import { render, screen } from "../../helpers/render";
import { CartSummary } from "@/components/cart/CartSummary";
import { createMockCart, createMockCartItem, emptyMockCart } from "../../helpers/cart";

describe("CartSummary", () => {
  describe("heading", () => {
    it("renders order summary heading", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByRole("heading", { name: "Order Summary" })).toBeInTheDocument();
    });
  });

  describe("price breakdown", () => {
    it("renders subtotal amount", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("€349.99")).toBeInTheDocument();
    });

    it("renders subtotal line with item count", () => {
      render(<CartSummary cart={createMockCart({ totalItems: 1 })} />);
      expect(screen.getByText("Subtotal (1 items)")).toBeInTheDocument();
    });

    it("renders subtotal line with multiple item count", () => {
      const item2 = createMockCartItem({ productId: "p2" });
      render(<CartSummary cart={createMockCart({ items: [createMockCartItem(), item2], totalItems: 2 })} />);
      expect(screen.getByText("Subtotal (2 items)")).toBeInTheDocument();
    });

    it("renders VAT line with rate from first item", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("VAT (21%)")).toBeInTheDocument();
    });

    it("renders VAT (0%) when cart has no items", () => {
      render(<CartSummary cart={emptyMockCart()} />);
      expect(screen.getByText("VAT (0%)")).toBeInTheDocument();
    });

    it("renders VAT amount", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("€73.50")).toBeInTheDocument();
    });
  });

  describe("shipping", () => {
    it("shows FREE when subtotal is above threshold", () => {
      render(<CartSummary cart={createMockCart()} />); // subtotal: 349.99
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("shows FREE when subtotal is exactly at threshold (100)", () => {
      render(<CartSummary cart={createMockCart({ subtotal: 100 })} />);
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });

    it("shows €4.99 when subtotal is below threshold", () => {
      render(<CartSummary cart={createMockCart({ subtotal: 50 })} />);
      expect(screen.getByText("€4.99")).toBeInTheDocument();
    });

    it("does not show €4.99 when free shipping applies", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.queryByText("€4.99")).not.toBeInTheDocument();
    });
  });

  describe("total", () => {
    it("shows cart.total without extra cost when free shipping applies", () => {
      // createMockCart() has subtotal: 349.99 (>= 100) and total: 423.49
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("€423.49")).toBeInTheDocument();
    });

    it("adds €4.99 to cart.total when shipping is not free", () => {
      // subtotal: 50 → no free shipping; total: 60 → displayed as 60 + 4.99 = 64.99
      render(<CartSummary cart={createMockCart({ subtotal: 50, total: 60 })} />);
      expect(screen.getByText("€64.99")).toBeInTheDocument();
    });
  });

  describe("free shipping notice banner", () => {
    it("shows banner when subtotal is above threshold", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("FREE Shipping")).toBeInTheDocument();
      expect(screen.getByText("Your order exceeds 100 EUR. Free shipping included!")).toBeInTheDocument();
    });

    it("hides banner when subtotal is below threshold", () => {
      render(<CartSummary cart={createMockCart({ subtotal: 50 })} />);
      expect(screen.queryByText("FREE Shipping")).not.toBeInTheDocument();
    });

    it("shows banner when subtotal is exactly at threshold (100)", () => {
      render(<CartSummary cart={createMockCart({ subtotal: 100 })} />);
      expect(screen.getByText("FREE Shipping")).toBeInTheDocument();
    });
  });

  describe("secure payment badge", () => {
    it("renders secure payment text", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("Secure payment with SSL encryption")).toBeInTheDocument();
    });
  });

  describe("CTA buttons", () => {
    it("renders proceed to checkout link pointing to /checkout", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByRole("link", { name: "Proceed to checkout" })).toHaveAttribute("href", "/checkout");
    });

    it("renders continue shopping link pointing to /productos", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/productos");
    });

    it("disables checkout button when isLoading is true", () => {
      render(<CartSummary cart={createMockCart()} isLoading={true} />);
      const checkoutLink = screen.getByRole("link", { name: "Proceed to checkout" });
      expect(checkoutLink).toHaveAttribute("disabled");
    });

    it("does not disable checkout button when isLoading is false", () => {
      render(<CartSummary cart={createMockCart()} isLoading={false} />);
      const checkoutLink = screen.getByRole("link", { name: "Proceed to checkout" });
      expect(checkoutLink).not.toHaveAttribute("disabled");
    });

    it("does not disable checkout button when isLoading is not provided", () => {
      render(<CartSummary cart={createMockCart()} />);
      const checkoutLink = screen.getByRole("link", { name: "Proceed to checkout" });
      expect(checkoutLink).not.toHaveAttribute("disabled");
    });
  });

  describe("payment methods", () => {
    it("renders payment methods label", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("We accept")).toBeInTheDocument();
    });

    it("renders Visa badge", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("Visa")).toBeInTheDocument();
    });

    it("renders Mastercard badge", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("Mastercard")).toBeInTheDocument();
    });

    it("renders PayPal badge", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("PayPal")).toBeInTheDocument();
    });

    it("renders Klarna badge", () => {
      render(<CartSummary cart={createMockCart()} />);
      expect(screen.getByText("Klarna")).toBeInTheDocument();
    });
  });
});
