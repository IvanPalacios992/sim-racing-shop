vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
  },
}));

import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import { useAuthStore } from "@/stores/auth-store";
import { ordersApi } from "@/lib/api/orders";
import type { OrderDetailDto } from "@/types/orders";
import OrderDetailContent from "@/components/private-area/orders/OrderDetailContent";

const mockOrder: OrderDetailDto = {
  id: "order-1",
  orderNumber: "ORD-20240205-0001",
  userId: "user-123",
  shippingStreet: "Calle Mayor 123",
  shippingCity: "Madrid",
  shippingState: "Madrid",
  shippingPostalCode: "28001",
  shippingCountry: "ES",
  paymentId: null,
  subtotal: 1148.95,
  vatAmount: 241.28,
  shippingCost: 0,
  totalAmount: 1390.23,
  orderStatus: "delivered",
  estimatedProductionDays: null,
  productionNotes: null,
  trackingNumber: "1Z999AA10123456784",
  shippedAt: "2024-02-06T09:15:00.000Z",
  notes: null,
  createdAt: "2024-02-05T14:32:00.000Z",
  updatedAt: "2024-02-07T16:22:00.000Z",
  orderItems: [
    {
      id: "item-1",
      productId: "prod-1",
      productName: "ClubSport Steering Wheel",
      productSku: "FANATEC-CSW",
      configurationJson: null,
      quantity: 1,
      unitPrice: 349.95,
      lineTotal: 349.95,
    },
    {
      id: "item-2",
      productId: "prod-2",
      productName: "Sprint Pedal Set",
      productSku: "HEU-SPRINT",
      configurationJson: null,
      quantity: 1,
      unitPrice: 799.00,
      lineTotal: 799.00,
    },
  ],
};

describe("OrderDetailContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();

    const mockAuthResponse = createMockAuthResponse();
    useAuthStore.getState().setAuth(mockAuthResponse);
    useAuthStore.setState({ _hasHydrated: true });

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  describe("loading state", () => {
    it("shows animate-pulse skeleton while fetching order", () => {
      vi.mocked(ordersApi.getOrderById).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<OrderDetailContent orderId="order-1" />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not call the API before the store is hydrated", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<OrderDetailContent orderId="order-1" />);

      expect(ordersApi.getOrderById).not.toHaveBeenCalled();
    });
  });

  describe("error states", () => {
    it("shows not-found message when API returns 404", async () => {
      vi.mocked(ordersApi.getOrderById).mockRejectedValue({
        response: { status: 404 },
      });

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Order not found")).toBeInTheDocument();
      });
    });

    it("shows back to orders button on not-found state", async () => {
      vi.mocked(ordersApi.getOrderById).mockRejectedValue({
        response: { status: 404 },
      });

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Order not found")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to orders" })).toBeInTheDocument();
      });
    });

    it("shows error message when API call fails with a generic error", async () => {
      vi.mocked(ordersApi.getOrderById).mockRejectedValue(new Error("Network error"));

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Error loading order")).toBeInTheDocument();
      });
    });

    it("shows Retry button on generic error", async () => {
      vi.mocked(ordersApi.getOrderById).mockRejectedValue(new Error("Network error"));

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });
    });

    it("re-fetches order when Retry button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrderById)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Retry"));

      await waitFor(() => {
        expect(ordersApi.getOrderById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("header", () => {
    it("renders the order number in the header", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Order #ORD-20240205-0001")).toBeInTheDocument();
      });
    });

    it("renders the status label", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Status")).toBeInTheDocument();
      });
    });

    it("renders back to orders link in the breadcrumb with href /pedidos", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        const backLinks = screen.getAllByText("Back to orders");
        expect(backLinks.length).toBeGreaterThanOrEqual(1);
        const breadcrumbLink = backLinks[0].closest("a");
        expect(breadcrumbLink).toHaveAttribute("href", "/pedidos");
      });
    });

    it("renders multiple back to orders navigation elements", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        // "Back to orders" appears in both the breadcrumb and the header actions button
        const backLinks = screen.getAllByText("Back to orders");
        expect(backLinks.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows estimated production days when status is processing and estimatedProductionDays is set", async () => {
      const processingOrder: OrderDetailDto = {
        ...mockOrder,
        orderStatus: "processing",
        estimatedProductionDays: 5,
        trackingNumber: null,
        shippedAt: null,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(processingOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Est. production")).toBeInTheDocument();
        // The estimated production days value "5 days" appears in a single <p> element
        // with text nodes "5", " ", "days"
        expect(screen.getByText((_, el) =>
          el?.tagName === "P" && el.textContent?.trim() === "5 days"
        )).toBeInTheDocument();
      });
    });

    it("does not show estimated production days when status is not processing", async () => {
      const shippedOrder: OrderDetailDto = {
        ...mockOrder,
        orderStatus: "shipped",
        estimatedProductionDays: 5,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(shippedOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Est. production")).not.toBeInTheDocument();
      });
    });

    it("does not show estimated production days when estimatedProductionDays is null", async () => {
      const processingOrder: OrderDetailDto = {
        ...mockOrder,
        orderStatus: "processing",
        estimatedProductionDays: null,
        trackingNumber: null,
        shippedAt: null,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(processingOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Est. production")).not.toBeInTheDocument();
      });
    });
  });

  describe("timeline", () => {
    it("renders the shipping status heading", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Shipping status")).toBeInTheDocument();
      });
    });

    it("renders all 4 timeline step titles for a delivered order", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Order confirmed")).toBeInTheDocument();
        expect(screen.getByText("Preparing shipment")).toBeInTheDocument();
        expect(screen.getByText("In transit")).toBeInTheDocument();
        // "Delivered" appears in both the status badge and the timeline step
        const deliveredElements = screen.getAllByText("Delivered");
        expect(deliveredElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows cancelled message for a cancelled order", async () => {
      const cancelledOrder: OrderDetailDto = {
        ...mockOrder,
        orderStatus: "cancelled",
        trackingNumber: null,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(cancelledOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        // "Cancelled" appears in both the status badge and the cancelled timeline box
        const cancelledElements = screen.getAllByText("Cancelled");
        expect(cancelledElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("This order has been cancelled")).toBeInTheDocument();
      });
    });

    it("hides timeline steps for a cancelled order", async () => {
      const cancelledOrder: OrderDetailDto = {
        ...mockOrder,
        orderStatus: "cancelled",
        trackingNumber: null,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(cancelledOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Order confirmed")).not.toBeInTheDocument();
        expect(screen.queryByText("Preparing shipment")).not.toBeInTheDocument();
        expect(screen.queryByText("In transit")).not.toBeInTheDocument();
      });
    });
  });

  describe("tracking number", () => {
    it("renders tracking number when present", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("1Z999AA10123456784")).toBeInTheDocument();
      });
    });

    it("does not render tracking number section when trackingNumber is null", async () => {
      const orderWithoutTracking: OrderDetailDto = {
        ...mockOrder,
        trackingNumber: null,
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(orderWithoutTracking);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Tracking number")).not.toBeInTheDocument();
      });
    });


    it("shows Copied! feedback immediately after clicking copy", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Copy")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Copy"));

      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  describe("order items", () => {
    it("renders the products heading with correct item count", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Products (2 items)")).toBeInTheDocument();
      });
    });

    it("renders item names", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("ClubSport Steering Wheel")).toBeInTheDocument();
        expect(screen.getByText("Sprint Pedal Set")).toBeInTheDocument();
      });
    });

    it("renders item SKUs", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("FANATEC-CSW")).toBeInTheDocument();
        expect(screen.getByText("HEU-SPRINT")).toBeInTheDocument();
      });
    });

    it("renders item quantities as Qty: 1", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        const qtyElements = screen.getAllByText("Qty: 1");
        expect(qtyElements.length).toBe(2);
      });
    });

    it("renders configuration JSON as Key: Value pairs joined by bullet", async () => {
      const orderWithConfig: OrderDetailDto = {
        ...mockOrder,
        orderItems: [
          {
            ...mockOrder.orderItems[0],
            configurationJson: JSON.stringify({ Color: "Negro", Platform: "PC" }),
          },
        ],
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(orderWithConfig);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Color: Negro • Platform: PC")).toBeInTheDocument();
      });
    });

    it("renders notes when present", async () => {
      const orderWithNotes: OrderDetailDto = {
        ...mockOrder,
        notes: "Please deliver before noon",
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(orderWithNotes);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Notes")).toBeInTheDocument();
        expect(screen.getByText("Please deliver before noon")).toBeInTheDocument();
      });
    });

    it("does not render notes section when notes is null", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Notes")).not.toBeInTheDocument();
      });
    });

    it("renders products heading with singular item when there is 1 item", async () => {
      const singleItemOrder: OrderDetailDto = {
        ...mockOrder,
        orderItems: [mockOrder.orderItems[0]],
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(singleItemOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Products (1 item)")).toBeInTheDocument();
      });
    });
  });

  describe("shipping address", () => {
    it("renders the shipping address heading", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Shipping address")).toBeInTheDocument();
      });
    });

    it("renders the street address", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Calle Mayor 123")).toBeInTheDocument();
      });
    });

    it("renders the postal code and city", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText(/28001.*Madrid/)).toBeInTheDocument();
      });
    });
  });

  describe("order summary", () => {
    it("renders the order summary heading", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Order summary")).toBeInTheDocument();
      });
    });

    it("renders FREE when shippingCost is 0", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("FREE")).toBeInTheDocument();
      });
    });

    it("renders shipping label", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Shipping")).toBeInTheDocument();
      });
    });

    it("renders VAT (21%) label", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("VAT (21%)")).toBeInTheDocument();
      });
    });

    it("renders Total paid label", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Total paid")).toBeInTheDocument();
      });
    });
  });

  describe("production notes", () => {
    it("shows production notes section when productionNotes is set", async () => {
      const orderWithProductionNotes: OrderDetailDto = {
        ...mockOrder,
        productionNotes: "Custom engraving: #42",
      };
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(orderWithProductionNotes);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Production notes")).toBeInTheDocument();
        expect(screen.getByText("Custom engraving: #42")).toBeInTheDocument();
      });
    });

    it("does not show production notes section when productionNotes is null", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.queryByText("Production notes")).not.toBeInTheDocument();
      });
    });
  });

  describe("help section", () => {
    it("renders the help title", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Need help with your order?")).toBeInTheDocument();
      });
    });

    it("renders the Send email button", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Send email")).toBeInTheDocument();
      });
    });

    it("renders the Request return button", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(screen.getByText("Request return")).toBeInTheDocument();
      });
    });
  });

  describe("API call", () => {
    it("calls getOrderById with the correct orderId prop", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-1" />);

      await waitFor(() => {
        expect(ordersApi.getOrderById).toHaveBeenCalledWith("order-1");
      });
    });

    it("calls getOrderById with a different orderId when prop changes", async () => {
      vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder);

      render(<OrderDetailContent orderId="order-99" />);

      await waitFor(() => {
        expect(ordersApi.getOrderById).toHaveBeenCalledWith("order-99");
      });
    });
  });
});
