import { adminComponentsApi } from "@/lib/api/admin-components";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 };

const mockComponent = {
  id: "comp-1",
  sku: "WHEEL-BASE-001",
  name: "Base de volante DD Pro",
  componentType: "WheelBase",
  stockQuantity: 10,
  inStock: true,
  weightGrams: 2500,
};

describe("adminComponentsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── list ──────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("calls GET /components with Locale, PageSize and Page params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminComponentsApi.list("es");

      expect(apiClient.get).toHaveBeenCalledWith("/components", {
        params: { Locale: "es", PageSize: 100, Page: 1 },
      });
    });

    it("uses 'es' as default locale", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminComponentsApi.list();

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params.Locale).toBe("es");
    });

    it("returns the items array from paginated response", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { ...emptyPaginated, items: [mockComponent], totalCount: 1 },
      });

      const result = await adminComponentsApi.list("es");

      expect(result).toEqual([mockComponent]);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("calls POST /admin/components with the dto", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockComponent });

      const dto = {
        sku: "WHEEL-BASE-001",
        componentType: "WheelBase",
        stockQuantity: 10,
        minStockThreshold: 5,
        leadTimeDays: 7,
        weightGrams: null,
        costPrice: null,
        translations: [{ locale: "es", name: "Base de volante" }],
      };
      await adminComponentsApi.create(dto);

      expect(apiClient.post).toHaveBeenCalledWith("/admin/components", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockComponent });

      const result = await adminComponentsApi.create({
        sku: "X",
        componentType: "WheelBase",
        stockQuantity: 0,
        minStockThreshold: 5,
        leadTimeDays: 7,
        weightGrams: null,
        costPrice: null,
        translations: [],
      });

      expect(result).toEqual(mockComponent);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("calls PUT /admin/components/{id} with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockComponent });

      const dto = {
        componentType: "WheelBase",
        stockQuantity: 20,
        minStockThreshold: 5,
        leadTimeDays: 7,
        weightGrams: null,
        costPrice: null,
      };
      await adminComponentsApi.update("comp-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/components/comp-1", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockComponent });

      const result = await adminComponentsApi.update("comp-1", {
        componentType: "WheelBase",
        stockQuantity: 5,
        minStockThreshold: 2,
        leadTimeDays: 3,
        weightGrams: null,
        costPrice: null,
      });

      expect(result).toEqual(mockComponent);
    });
  });

  // ── updateTranslations ────────────────────────────────────────────────────

  describe("updateTranslations", () => {
    it("calls PUT /admin/components/{id}/translations with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockComponent });

      const dto = {
        translations: [{ locale: "en", name: "DD Pro Wheel Base", description: "Direct drive" }],
      };
      await adminComponentsApi.updateTranslations("comp-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/components/comp-1/translations", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockComponent });

      const result = await adminComponentsApi.updateTranslations("comp-1", { translations: [] });

      expect(result).toEqual(mockComponent);
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("calls DELETE /admin/components/{id}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await adminComponentsApi.delete("comp-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/admin/components/comp-1");
    });

    it("resolves without returning a value", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await adminComponentsApi.delete("comp-1");

      expect(result).toBeUndefined();
    });
  });
});
