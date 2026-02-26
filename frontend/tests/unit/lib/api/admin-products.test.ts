import { adminProductsApi } from "@/lib/api/admin-products";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };

const mockProduct = {
  id: "prod-1",
  sku: "WHEEL-GT3-001",
  name: "Volante GT3",
  slug: "volante-gt3",
  basePrice: 299.99,
  vatRate: 21,
  isActive: true,
  isCustomizable: true,
  baseProductionDays: 7,
  weightGrams: null,
  model3dUrl: null,
  model3dSizeKb: null,
  shortDescription: null,
  longDescription: null,
  metaTitle: null,
  metaDescription: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockOption = {
  id: "opt-1",
  componentId: "comp-1",
  componentSku: "WHEEL-BASE-001",
  optionGroup: "Volante",
  isGroupRequired: true,
  glbObjectName: "Rim_Mesh",
  thumbnailUrl: null,
  priceModifier: 0,
  isDefault: true,
  displayOrder: 0,
};

describe("adminProductsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── list ──────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("calls GET /products with Locale, PageSize and Page params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminProductsApi.list("es");

      expect(apiClient.get).toHaveBeenCalledWith("/products", {
        params: { Locale: "es", PageSize: 10, Page: 1 },
      });
    });

    it("uses 'es' as default locale", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminProductsApi.list();

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params.Locale).toBe("es");
    });

    it("returns the paginated result object", async () => {
      const paginated = { ...emptyPaginated, items: [mockProduct], totalCount: 1, totalPages: 1 };
      vi.mocked(apiClient.get).mockResolvedValue({ data: paginated });

      const result = await adminProductsApi.list("es");

      expect(result).toEqual(paginated);
    });
  });

  // ── getProductBothLocales ─────────────────────────────────────────────────

  describe("getProductBothLocales", () => {
    it("calls GET /products/{id} twice with different locales", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProduct });

      await adminProductsApi.getProductBothLocales("prod-1");

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith("/products/prod-1", { params: { locale: "es" } });
      expect(apiClient.get).toHaveBeenCalledWith("/products/prod-1", { params: { locale: "en" } });
    });

    it("returns { es, en } with response data", async () => {
      const esData = { ...mockProduct, name: "Volante GT3" };
      const enData = { ...mockProduct, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" };
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: esData })
        .mockResolvedValueOnce({ data: enData });

      const result = await adminProductsApi.getProductBothLocales("prod-1");

      expect(result.es).toEqual(esData);
      expect(result.en).toEqual(enData);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("calls POST /admin/products with the dto", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockProduct });

      const dto = {
        sku: "WHEEL-GT3-001",
        basePrice: 299.99,
        vatRate: 21,
        model3dUrl: null,
        model3dSizeKb: null,
        isActive: true,
        isCustomizable: true,
        baseProductionDays: 7,
        weightGrams: null,
        translations: [{ locale: "es", name: "Volante GT3", slug: "volante-gt3" }],
      };
      await adminProductsApi.create(dto);

      expect(apiClient.post).toHaveBeenCalledWith("/admin/products", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockProduct });

      const result = await adminProductsApi.create({
        sku: "X",
        basePrice: 100,
        vatRate: 21,
        model3dUrl: null,
        model3dSizeKb: null,
        isActive: true,
        isCustomizable: false,
        baseProductionDays: 7,
        weightGrams: null,
        translations: [],
      });

      expect(result).toEqual(mockProduct);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("calls PUT /admin/products/{id} with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProduct });

      const dto = {
        basePrice: 349.99,
        vatRate: 21,
        model3dUrl: null,
        model3dSizeKb: null,
        isActive: false,
        isCustomizable: true,
        baseProductionDays: 10,
        weightGrams: 500,
      };
      await adminProductsApi.update("prod-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/products/prod-1", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProduct });

      const result = await adminProductsApi.update("prod-1", {
        basePrice: 100,
        vatRate: 21,
        model3dUrl: null,
        model3dSizeKb: null,
        isActive: true,
        isCustomizable: false,
        baseProductionDays: 7,
        weightGrams: null,
      });

      expect(result).toEqual(mockProduct);
    });
  });

  // ── updateTranslations ────────────────────────────────────────────────────

  describe("updateTranslations", () => {
    it("calls PUT /admin/products/{id}/translations with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProduct });

      const dto = {
        translations: [{ locale: "en", name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" }],
      };
      await adminProductsApi.updateTranslations("prod-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/products/prod-1/translations", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProduct });

      const result = await adminProductsApi.updateTranslations("prod-1", { translations: [] });

      expect(result).toEqual(mockProduct);
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("calls DELETE /admin/products/{id}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await adminProductsApi.delete("prod-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/admin/products/prod-1");
    });

    it("resolves without returning a value", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await adminProductsApi.delete("prod-1");

      expect(result).toBeUndefined();
    });
  });

  // ── getComponentOptions ───────────────────────────────────────────────────

  describe("getComponentOptions", () => {
    it("calls GET /admin/products/{id}/component-options", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      await adminProductsApi.getComponentOptions("prod-1");

      expect(apiClient.get).toHaveBeenCalledWith("/admin/products/prod-1/component-options");
    });

    it("returns the response array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockOption] });

      const result = await adminProductsApi.getComponentOptions("prod-1");

      expect(result).toEqual([mockOption]);
    });
  });

  // ── addComponentOption ────────────────────────────────────────────────────

  describe("addComponentOption", () => {
    it("calls POST /admin/products/{id}/component-options with the dto", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockOption });

      const dto = {
        componentId: "comp-1",
        optionGroup: "Volante",
        isGroupRequired: true,
        glbObjectName: "Rim_Mesh",
        thumbnailUrl: null,
        priceModifier: 0,
        isDefault: true,
        displayOrder: 0,
      };
      await adminProductsApi.addComponentOption("prod-1", dto);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/admin/products/prod-1/component-options",
        dto
      );
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockOption });

      const result = await adminProductsApi.addComponentOption("prod-1", {
        componentId: "comp-1",
        optionGroup: "Volante",
        isGroupRequired: false,
        glbObjectName: null,
        thumbnailUrl: null,
        priceModifier: 0,
        isDefault: false,
        displayOrder: 0,
      });

      expect(result).toEqual(mockOption);
    });
  });

  // ── updateComponentOption ─────────────────────────────────────────────────

  describe("updateComponentOption", () => {
    it("calls PUT /admin/products/{id}/component-options/{optionId} with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockOption });

      const dto = {
        componentId: "comp-1",
        optionGroup: "Volante",
        isGroupRequired: true,
        glbObjectName: "Rim_Mesh",
        thumbnailUrl: null,
        priceModifier: 50,
        isDefault: false,
        displayOrder: 1,
      };
      await adminProductsApi.updateComponentOption("prod-1", "opt-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith(
        "/admin/products/prod-1/component-options/opt-1",
        dto
      );
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockOption });

      const result = await adminProductsApi.updateComponentOption("prod-1", "opt-1", {
        componentId: "comp-1",
        optionGroup: "Volante",
        isGroupRequired: false,
        glbObjectName: null,
        thumbnailUrl: null,
        priceModifier: 0,
        isDefault: true,
        displayOrder: 0,
      });

      expect(result).toEqual(mockOption);
    });
  });

  // ── deleteComponentOption ─────────────────────────────────────────────────

  describe("deleteComponentOption", () => {
    it("calls DELETE /admin/products/{id}/component-options/{optionId}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await adminProductsApi.deleteComponentOption("prod-1", "opt-1");

      expect(apiClient.delete).toHaveBeenCalledWith(
        "/admin/products/prod-1/component-options/opt-1"
      );
    });

    it("resolves without returning a value", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await adminProductsApi.deleteComponentOption("prod-1", "opt-1");

      expect(result).toBeUndefined();
    });
  });

  // ── getCategories ─────────────────────────────────────────────────────────

  describe("getCategories", () => {
    const mockCategories = [
      { id: "cat-1", name: "Volantes", slug: "volantes" },
      { id: "cat-2", name: "Pedales", slug: "pedales" },
    ];

    it("calls GET /admin/products/{id}/categories", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories });

      await adminProductsApi.getCategories("prod-1");

      expect(apiClient.get).toHaveBeenCalledWith("/admin/products/prod-1/categories");
    });

    it("returns the response array", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories });

      const result = await adminProductsApi.getCategories("prod-1");

      expect(result).toEqual(mockCategories);
    });

    it("returns empty array when product has no categories", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await adminProductsApi.getCategories("prod-1");

      expect(result).toEqual([]);
    });
  });

  // ── setCategories ─────────────────────────────────────────────────────────

  describe("setCategories", () => {
    const mockCategories = [{ id: "cat-1", name: "Volantes", slug: "volantes" }];

    it("calls PUT /admin/products/{id}/categories with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategories });

      const dto = { categoryIds: ["cat-1", "cat-2"] };
      await adminProductsApi.setCategories("prod-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/products/prod-1/categories", dto);
    });

    it("returns the updated categories array", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategories });

      const result = await adminProductsApi.setCategories("prod-1", { categoryIds: ["cat-1"] });

      expect(result).toEqual(mockCategories);
    });

    it("calls PUT with empty categoryIds to remove all categories", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: [] });

      const dto = { categoryIds: [] };
      await adminProductsApi.setCategories("prod-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/products/prod-1/categories", dto);
    });
  });
});
