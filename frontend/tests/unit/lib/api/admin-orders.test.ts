import { adminOrdersApi } from "@/lib/api/admin-orders";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };

const mockOrderSummary = {
  id: "order-1",
  orderNumber: "ORD-20260201-0001",
  userEmail: "user@example.com",
  totalAmount: 369.23,
  orderStatus: "pending",
  createdAt: "2026-02-01T10:00:00Z",
  itemCount: 2,
};

const mockOrderDetail = {
  id: "order-1",
  orderNumber: "ORD-20260201-0001",
  userEmail: "user@example.com",
  orderStatus: "pending",
  orderItems: [],
};

describe("adminOrdersApi", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── list ───────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("llama a GET /admin/orders con Page y PageSize por defecto", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminOrdersApi.list();

      expect(apiClient.get).toHaveBeenCalledWith("/admin/orders", {
        params: { Page: 1, PageSize: 20 },
      });
    });

    it("envía los parámetros de página personalizados", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminOrdersApi.list(2, 10);

      expect(apiClient.get).toHaveBeenCalledWith("/admin/orders", {
        params: { Page: 2, PageSize: 10 },
      });
    });

    it("envía el parámetro Status cuando se proporciona", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminOrdersApi.list(1, 20, "pending");

      expect(apiClient.get).toHaveBeenCalledWith("/admin/orders", {
        params: { Page: 1, PageSize: 20, Status: "pending" },
      });
    });

    it("no envía Status cuando es undefined", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminOrdersApi.list(1, 20, undefined);

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      const params = (opts as { params: Record<string, unknown> }).params;
      expect(params).not.toHaveProperty("Status");
    });

    it("devuelve el resultado paginado", async () => {
      const paginated = { ...emptyPaginated, items: [mockOrderSummary], totalCount: 1, totalPages: 1 };
      vi.mocked(apiClient.get).mockResolvedValue({ data: paginated });

      const result = await adminOrdersApi.list();

      expect(result).toEqual(paginated);
    });
  });

  // ── getById ────────────────────────────────────────────────────────────────

  describe("getById", () => {
    it("llama a GET /admin/orders/{id}", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockOrderDetail });

      await adminOrdersApi.getById("order-1");

      expect(apiClient.get).toHaveBeenCalledWith("/admin/orders/order-1");
    });

    it("devuelve response.data", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockOrderDetail });

      const result = await adminOrdersApi.getById("order-1");

      expect(result).toEqual(mockOrderDetail);
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────

  describe("updateStatus", () => {
    it("llama a PATCH /admin/orders/{id}/status con el dto", async () => {
      const updatedOrder = { ...mockOrderDetail, orderStatus: "processing" };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedOrder });

      await adminOrdersApi.updateStatus("order-1", { status: "processing" });

      expect(apiClient.patch).toHaveBeenCalledWith("/admin/orders/order-1/status", {
        status: "processing",
      });
    });

    it("devuelve response.data con el pedido actualizado", async () => {
      const updatedOrder = { ...mockOrderDetail, orderStatus: "processing" };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedOrder });

      const result = await adminOrdersApi.updateStatus("order-1", { status: "processing" });

      expect(result).toEqual(updatedOrder);
    });
  });
});
