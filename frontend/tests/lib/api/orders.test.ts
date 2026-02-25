import type { OrderDetailDto, OrderSummaryDto, CreateOrderDto } from "@/types/orders";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  default: { get: mockGet, post: mockPost },
  apiClient: { get: mockGet, post: mockPost },
}));

import { ordersApi } from "@/lib/api/orders";

const mockSummary: OrderSummaryDto = {
  id: "order-1",
  orderNumber: "ORD-20260101-0001",
  totalAmount: 429.74,
  orderStatus: "pending",
  createdAt: new Date().toISOString(),
  items: [],
};

const mockDetail: OrderDetailDto = {
  id: "order-1",
  orderNumber: "ORD-20260101-0001",
  userId: "user-1",
  shippingStreet: "Calle Mayor 1",
  shippingCity: "Madrid",
  shippingState: null,
  shippingPostalCode: "28001",
  shippingCountry: "ES",
  paymentId: null,
  subtotal: 349.99,
  vatAmount: 73.5,
  shippingCost: 6.25,
  totalAmount: 429.74,
  orderStatus: "pending",
  estimatedProductionDays: 7,
  productionNotes: null,
  trackingNumber: null,
  shippedAt: null,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  orderItems: [],
};

describe("ordersApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getOrders ──────────────────────────────────────────────────────────────

  describe("getOrders", () => {
    it("calls GET /orders", async () => {
      mockGet.mockResolvedValue({ data: [mockSummary] });

      await ordersApi.getOrders();

      expect(mockGet).toHaveBeenCalledWith("/orders");
    });

    it("returns response data", async () => {
      mockGet.mockResolvedValue({ data: [mockSummary] });

      const result = await ordersApi.getOrders();

      expect(result).toEqual([mockSummary]);
    });
  });

  // ── getOrderById ───────────────────────────────────────────────────────────

  describe("getOrderById", () => {
    it("calls GET /orders/{id}", async () => {
      mockGet.mockResolvedValue({ data: mockDetail });

      await ordersApi.getOrderById("order-1");

      expect(mockGet).toHaveBeenCalledWith("/orders/order-1");
    });

    it("returns response data", async () => {
      mockGet.mockResolvedValue({ data: mockDetail });

      const result = await ordersApi.getOrderById("order-1");

      expect(result).toEqual(mockDetail);
    });
  });

  // ── createOrder ────────────────────────────────────────────────────────────

  describe("createOrder", () => {
    const dto: CreateOrderDto = {
      shippingStreet: "Calle Mayor 1",
      shippingCity: "Madrid",
      shippingPostalCode: "28001",
      shippingCountry: "ES",
      subtotal: 349.99,
      vatAmount: 73.5,
      shippingCost: 6.25,
      totalAmount: 429.74,
      orderItems: [],
    };

    it("calls POST /orders with the dto", async () => {
      mockPost.mockResolvedValue({ data: mockDetail });

      await ordersApi.createOrder(dto);

      expect(mockPost).toHaveBeenCalledWith("/orders", dto);
    });

    it("returns response data", async () => {
      mockPost.mockResolvedValue({ data: mockDetail });

      const result = await ordersApi.createOrder(dto);

      expect(result).toEqual(mockDetail);
    });
  });
});
