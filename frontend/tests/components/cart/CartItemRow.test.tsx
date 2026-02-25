import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { CartItemDto } from "@/types/cart";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));

import { CartItemRow } from "@/components/cart/CartItemRow";

function createItem(overrides?: Partial<CartItemDto>): CartItemDto {
  return {
    productId: "product-123",
    sku: "WHL-001",
    name: "Formula Steering Wheel",
    imageUrl: "https://example.com/product.jpg",
    quantity: 1,
    unitPrice: 100,
    vatRate: 21,
    subtotal: 100,
    ...overrides,
  };
}

describe("CartItemRow", () => {
  // ── rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders product name", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText("Formula Steering Wheel")).toBeInTheDocument();
    });

    it("renders product sku", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText("WHL-001")).toBeInTheDocument();
    });

    it("renders image when imageUrl is present", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByRole("img", { name: "Formula Steering Wheel" })).toBeInTheDocument();
    });

    it("renders placeholder icon when imageUrl is null", () => {
      render(<CartItemRow item={createItem({ imageUrl: null })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("shows total price with VAT applied", () => {
      // subtotal=100, vatRate=21 → 100 * 1.21 = 121.00
      render(<CartItemRow item={createItem({ subtotal: 100, vatRate: 21 })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText("€121.00")).toBeInTheDocument();
    });

    it("shows unit price per item when quantity > 1", () => {
      // unitPrice=100, vatRate=21 → 121.00 / ud.
      render(
        <CartItemRow
          item={createItem({ quantity: 2, unitPrice: 100, subtotal: 200, vatRate: 21 })}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      );
      expect(screen.getByText("€121.00 / ud.")).toBeInTheDocument();
    });

    it("does not show unit price when quantity is 1", () => {
      render(<CartItemRow item={createItem({ quantity: 1 })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.queryByText(/\/ ud\./)).not.toBeInTheDocument();
    });

    it("renders in-stock label", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText(/In stock/)).toBeInTheDocument();
    });

    it("renders remove button", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });
  });

  // ── selectedOptions ────────────────────────────────────────────────────────

  describe("selectedOptions", () => {
    it("shows options list when selectedOptions is present", () => {
      const item = createItem({
        selectedOptions: [
          { groupName: "Color", componentId: "opt-1", componentName: "Black" },
          { groupName: "Grip", componentId: "opt-2", componentName: "Rubber" },
        ],
      });
      render(<CartItemRow item={item} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText(/Black/)).toBeInTheDocument();
      expect(screen.getByText(/Rubber/)).toBeInTheDocument();
    });

    it("shows group name and component name for each option", () => {
      const item = createItem({
        selectedOptions: [
          { groupName: "Color", componentId: "opt-1", componentName: "Red" },
        ],
      });
      render(<CartItemRow item={item} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByText("Color:")).toBeInTheDocument();
      expect(screen.getByText("Red")).toBeInTheDocument();
    });

    it("does not render options section when selectedOptions is undefined", () => {
      render(<CartItemRow item={createItem({ selectedOptions: undefined })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("does not render options section when selectedOptions is empty", () => {
      render(<CartItemRow item={createItem({ selectedOptions: [] })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  // ── interactions ───────────────────────────────────────────────────────────

  describe("interactions", () => {
    it("calls onRemove when remove button is clicked", async () => {
      const onRemove = vi.fn();
      const user = userEvent.setup();
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={onRemove} />);

      await user.click(screen.getByRole("button", { name: "Remove" }));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("calls onUpdate with quantity+1 when increase is clicked", async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<CartItemRow item={createItem({ quantity: 3 })} onUpdate={onUpdate} onRemove={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Increase quantity" }));

      expect(onUpdate).toHaveBeenCalledWith(4);
    });

    it("calls onUpdate with quantity-1 when decrease is clicked", async () => {
      const onUpdate = vi.fn();
      const user = userEvent.setup();
      render(<CartItemRow item={createItem({ quantity: 3 })} onUpdate={onUpdate} onRemove={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Decrease quantity" }));

      expect(onUpdate).toHaveBeenCalledWith(2);
    });

    it("disables increase button when at max (99)", () => {
      render(<CartItemRow item={createItem({ quantity: 99 })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    });

    it("disables decrease button when at min (1)", () => {
      render(<CartItemRow item={createItem({ quantity: 1 })} onUpdate={vi.fn()} onRemove={vi.fn()} />);
      expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    });
  });

  // ── disabled state ─────────────────────────────────────────────────────────

  describe("disabled state", () => {
    it("disables remove button when isLoading is true", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} isLoading />);
      expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
    });

    it("disables increase button when isLoading is true", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} isLoading />);
      expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    });

    it("disables decrease button when isLoading is true", () => {
      render(<CartItemRow item={createItem()} onUpdate={vi.fn()} onRemove={vi.fn()} isLoading />);
      expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    });
  });
});
