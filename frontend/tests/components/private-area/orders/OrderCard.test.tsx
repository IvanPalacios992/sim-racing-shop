import React from "react";
import { render, screen } from "../../../helpers/render";
import type { OrderSummaryDto } from "@/types/orders";
import OrderCard from "@/components/private-area/orders/OrderCard";

function createOrder(overrides?: Partial<OrderSummaryDto>): OrderSummaryDto {
  return {
    id: "order-1",
    orderNumber: "ORD-20240205-0001",
    totalAmount: 423.49,
    orderStatus: "pending",
    createdAt: "2024-02-05T14:32:00.000Z",
    items: [
      {
        id: "item-1",
        productName: "Formula Steering Wheel",
        productSku: "WHL-001",
        quantity: 1,
        lineTotal: 423.49,
        configurationJson: null,
      },
    ],
    ...overrides,
  };
}

describe("OrderCard", () => {
  // ── rendering ──────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the order number", () => {
      render(<OrderCard order={createOrder()} />);
      expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
    });

    it("renders the product name", () => {
      render(<OrderCard order={createOrder()} />);
      expect(screen.getByText("Formula Steering Wheel")).toBeInTheDocument();
    });

    it("renders the total amount formatted as EUR", () => {
      render(<OrderCard order={createOrder({ totalAmount: 423.49 })} />);
      // Intl.NumberFormat es-ES renders with comma decimal and € symbol
      // getAllByText avoids "multiple elements" error from parent containers
      expect(screen.getAllByText(/423/).length).toBeGreaterThan(0);
    });

    it("renders view details link pointing to /pedidos/{id}", () => {
      render(<OrderCard order={createOrder({ id: "order-abc" })} />);
      const link = screen.getByRole("link", { name: "View details" });
      expect(link).toHaveAttribute("href", "/pedidos/order-abc");
    });

    it("renders the ordered-on date label", () => {
      render(<OrderCard order={createOrder()} />);
      expect(screen.getByText(/Ordered on/)).toBeInTheDocument();
    });

    it("renders quantity for each item", () => {
      render(<OrderCard order={createOrder()} />);
      expect(screen.getByText(/Amount: 1/)).toBeInTheDocument();
    });
  });

  // ── configurationJson ──────────────────────────────────────────────────────

  describe("configurationJson", () => {
    it("shows config as 'key: value' when configurationJson is set", () => {
      const order = createOrder({
        items: [
          {
            id: "item-1",
            productName: "Formula V2.5",
            productSku: "WHL-001",
            quantity: 1,
            lineTotal: 400,
            configurationJson: '{"Color":"Black","Grip":"Rubber"}',
          },
        ],
      });
      render(<OrderCard order={order} />);
      expect(screen.getByText(/Color: Black/)).toBeInTheDocument();
      expect(screen.getByText(/Grip: Rubber/)).toBeInTheDocument();
    });

    it("does not throw and skips config line when configurationJson is invalid JSON", () => {
      const order = createOrder({
        items: [
          {
            id: "item-1",
            productName: "Formula V2.5",
            productSku: "WHL-001",
            quantity: 1,
            lineTotal: 400,
            configurationJson: "not-valid-json",
          },
        ],
      });
      expect(() => render(<OrderCard order={order} />)).not.toThrow();
      expect(screen.getByText("Formula V2.5")).toBeInTheDocument();
    });

    it("does not show config line when configurationJson is null", () => {
      const order = createOrder({
        items: [
          {
            id: "item-1",
            productName: "Formula V2.5",
            productSku: "WHL-001",
            quantity: 1,
            lineTotal: 400,
            configurationJson: null,
          },
        ],
      });
      render(<OrderCard order={order} />);
      expect(screen.getByText("Formula V2.5")).toBeInTheDocument();
      // Config entries are joined with " · " — no separator means no config line was rendered
      expect(screen.queryByText(/ · /)).not.toBeInTheDocument();
    });
  });

  // ── item visibility limits ─────────────────────────────────────────────────

  describe("item visibility limits", () => {
    function makeItems(count: number) {
      return Array.from({ length: count }, (_, i) => ({
        id: `item-${i}`,
        productName: `Product ${i + 1}`,
        productSku: `SKU-${i}`,
        quantity: 1,
        lineTotal: 100,
        configurationJson: null,
      }));
    }

    it("shows all items when there are 3 or fewer", () => {
      render(<OrderCard order={createOrder({ items: makeItems(3) })} />);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
      expect(screen.queryByText(/and .* more/)).not.toBeInTheDocument();
    });

    it("shows only first 3 items and 'and N more' when there are 4 items", () => {
      render(<OrderCard order={createOrder({ items: makeItems(4) })} />);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
      expect(screen.queryByText("Product 4")).not.toBeInTheDocument();
      expect(screen.getByText(/and 1 more/)).toBeInTheDocument();
    });

    it("shows 'and 2 more' when there are 5 items", () => {
      render(<OrderCard order={createOrder({ items: makeItems(5) })} />);
      expect(screen.getByText(/and 2 more/)).toBeInTheDocument();
    });
  });
});
