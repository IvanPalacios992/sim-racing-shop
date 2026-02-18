import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import { useAuthStore } from "@/stores/auth-store";
import type { OrderSummaryDto } from "@/types/orders";

vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
  },
}));

import OrdersContent from "@/components/private-area/orders/OrdersContent";
import { ordersApi } from "@/lib/api/orders";

const mockOrders: OrderSummaryDto[] = [
  {
    id: "order-1",
    orderNumber: "ORD-20240205-0001",
    totalAmount: 1148.95,
    orderStatus: "delivered",
    createdAt: "2024-02-05T14:32:00.000Z",
    items: [
      { id: "item-1", productName: "ClubSport Steering Wheel", productSku: "FANATEC-CSW", quantity: 1, lineTotal: 349.95 },
      { id: "item-2", productName: "Sprint Pedal Set", productSku: "HEU-SPRINT", quantity: 1, lineTotal: 799.00 },
    ],
  },
  {
    id: "order-2",
    orderNumber: "ORD-20240210-0002",
    totalAmount: 499.00,
    orderStatus: "pending",
    createdAt: "2024-02-10T10:00:00.000Z",
    items: [
      { id: "item-3", productName: "Direct Drive Wheel Base", productSku: "SIMUCUBE-DD", quantity: 1, lineTotal: 499.00 },
    ],
  },
];

describe("OrdersContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();

    const mockAuthResponse = createMockAuthResponse();
    useAuthStore.getState().setAuth(mockAuthResponse);
    useAuthStore.setState({ _hasHydrated: true });
  });

  describe("loading state", () => {
    it("shows skeleton elements while fetching orders", () => {
      vi.mocked(ordersApi.getOrders).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<OrdersContent />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not call the API until the store is hydrated", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<OrdersContent />);

      expect(ordersApi.getOrders).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("shows error message when fetching orders fails", async () => {
      vi.mocked(ordersApi.getOrders).mockRejectedValue(new Error("Network error"));

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("Error loading orders")).toBeInTheDocument();
      });
    });

    it("shows Retry button when fetching orders fails", async () => {
      vi.mocked(ordersApi.getOrders).mockRejectedValue(new Error("Network error"));

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });
    });

    it("re-fetches orders when Retry button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrders)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Retry"));

      await waitFor(() => {
        expect(ordersApi.getOrders).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("empty state", () => {
    it("shows empty state heading when no orders exist", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue([]);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("No orders yet")).toBeInTheDocument();
      });
    });

    it("shows empty state subtitle when no orders exist", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue([]);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("When you place your first order it will appear here")).toBeInTheDocument();
      });
    });

    it("shows shop now link when no orders exist", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue([]);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("Explore products")).toBeInTheDocument();
      });
    });
  });

  describe("orders list", () => {
    it("renders the page title and subtitle", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("My Orders")).toBeInTheDocument();
        expect(screen.getByText("Check the status of your orders and previous purchases")).toBeInTheDocument();
      });
    });

    it("renders both order numbers", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
        expect(screen.getByText(/ORD-20240210-0002/)).toBeInTheDocument();
      });
    });

    it("renders product names inside order cards", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText("ClubSport Steering Wheel")).toBeInTheDocument();
        expect(screen.getByText("Sprint Pedal Set")).toBeInTheDocument();
        expect(screen.getByText("Direct Drive Wheel Base")).toBeInTheDocument();
      });
    });

    it("renders View details links for each order", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        const viewDetailsLinks = screen.getAllByText("View details");
        expect(viewDetailsLinks).toHaveLength(2);
      });
    });

    it("View details links point to the correct order detail pages", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        const viewDetailsLinks = screen.getAllByRole("link", { name: "View details" });
        const hrefs = viewDetailsLinks.map((link) => link.getAttribute("href"));
        expect(hrefs).toContain("/pedidos/order-1");
        expect(hrefs).toContain("/pedidos/order-2");
      });
    });
  });

  describe("filter chips", () => {
    it("renders all filter chips", async () => {
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Processing" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Shipped" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Delivered" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancelled" })).toBeInTheDocument();
      });
    });

    it("clicking Delivered filter hides the pending order", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
        expect(screen.getByText(/ORD-20240210-0002/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Delivered" }));

      expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
      expect(screen.queryByText(/ORD-20240210-0002/)).not.toBeInTheDocument();
    });

    it("clicking All after filtering shows all orders again", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Delivered" }));
      expect(screen.queryByText(/ORD-20240210-0002/)).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "All" }));

      expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
      expect(screen.getByText(/ORD-20240210-0002/)).toBeInTheDocument();
    });

    it("clicking Cancelled shows no orders for filter message", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Cancelled" }));

      expect(screen.getByText("No orders with this status")).toBeInTheDocument();
    });

    it("clicking All from the no-orders-for-filter message restores all orders", async () => {
      const user = userEvent.setup();
      vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

      render(<OrdersContent />);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Cancelled" }));

      expect(screen.getByText("No orders with this status")).toBeInTheDocument();

      // The inline "All" link inside the empty-filter message
      const allLinks = screen.getAllByText("All");
      await user.click(allLinks[allLinks.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(/ORD-20240205-0001/)).toBeInTheDocument();
        expect(screen.getByText(/ORD-20240210-0002/)).toBeInTheDocument();
      });
    });
  });
});
