import { productsApi } from "@/lib/api/products";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

const emptyPaginated = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
};

describe("productsApi", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getProducts ────────────────────────────────────────────────────────────

  describe("getProducts", () => {
    it("calls GET /products with required params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({ page: 1, pageSize: 12, locale: "en" });

      expect(apiClient.get).toHaveBeenCalledWith("/products", {
        params: { Page: 1, PageSize: 12, Locale: "en" },
      });
    });

    it("includes search param when provided", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({
        page: 1,
        pageSize: 12,
        locale: "en",
        search: "steering wheel",
      });

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params.Search).toBe(
        "steering wheel"
      );
    });

    it("includes minPrice and maxPrice when provided", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({
        page: 1,
        pageSize: 12,
        locale: "en",
        minPrice: 100,
        maxPrice: 500,
      });

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      const params = (opts as { params: Record<string, unknown> }).params;
      expect(params.MinPrice).toBe(100);
      expect(params.MaxPrice).toBe(500);
    });

    it("includes isCustomizable when provided", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({
        page: 1,
        pageSize: 12,
        locale: "en",
        isCustomizable: true,
      });

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect(
        (opts as { params: Record<string, unknown> }).params.IsCustomizable
      ).toBe(true);
    });

    it("includes sortBy and sortDescending when provided", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({
        page: 1,
        pageSize: 12,
        locale: "en",
        sortBy: "price",
        sortDescending: false,
      });

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      const params = (opts as { params: Record<string, unknown> }).params;
      expect(params.SortBy).toBe("price");
      expect(params.SortDescending).toBe(false);
    });

    it("omits undefined optional params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await productsApi.getProducts({ page: 1, pageSize: 12, locale: "en" });

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      const params = (opts as { params: Record<string, unknown> }).params;
      expect(params).not.toHaveProperty("Search");
      expect(params).not.toHaveProperty("MinPrice");
      expect(params).not.toHaveProperty("MaxPrice");
      expect(params).not.toHaveProperty("IsCustomizable");
      expect(params).not.toHaveProperty("SortBy");
      expect(params).not.toHaveProperty("SortDescending");
    });

    it("returns response.data", async () => {
      const mockData = {
        items: [{ id: "1", name: "Formula V2.5" }],
        totalCount: 1,
        page: 1,
        pageSize: 12,
        totalPages: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await productsApi.getProducts({
        page: 1,
        pageSize: 12,
        locale: "en",
      });

      expect(result).toEqual(mockData);
    });
  });

  // ── getProductBySlug ───────────────────────────────────────────────────────

  describe("getProductBySlug", () => {
    it("calls GET /products/slug/{slug} with Locale param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} });

      await productsApi.getProductBySlug("formula-v25", "en");

      expect(apiClient.get).toHaveBeenCalledWith("/products/slug/formula-v25", {
        params: { Locale: "en" },
      });
    });

    it("uses the locale passed as argument", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} });

      await productsApi.getProductBySlug("my-product", "es");

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params.Locale).toBe(
        "es"
      );
    });

    it("returns response.data", async () => {
      const mockProduct = { id: "1", name: "Formula V2.5" };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProduct });

      const result = await productsApi.getProductBySlug("formula-v25", "en");

      expect(result).toEqual(mockProduct);
    });
  });

  // ── getProductCustomizations ───────────────────────────────────────────────

  describe("getProductCustomizations", () => {
    it("calls GET /components/product/{id} with locale param", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      await productsApi.getProductCustomizations("prod-42", "en");

      expect(apiClient.get).toHaveBeenCalledWith("/components/product/prod-42", {
        params: { locale: "en" },
      });
    });

    it("returns an empty array when the API returns no options", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await productsApi.getProductCustomizations("prod-1", "en");

      expect(result).toEqual([]);
    });

    it("groups flat options by optionGroup", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [
          {
            componentId: "c1",
            name: "Black",
            description: null,
            optionGroup: "Color",
            isGroupRequired: true,
            glbObjectName: null,
            thumbnailUrl: null,
            priceModifier: 0,
            isDefault: true,
            displayOrder: 0,
            inStock: true,
          },
          {
            componentId: "c2",
            name: "Red",
            description: null,
            optionGroup: "Color",
            isGroupRequired: true,
            glbObjectName: null,
            thumbnailUrl: null,
            priceModifier: 10,
            isDefault: false,
            displayOrder: 1,
            inStock: true,
          },
          {
            componentId: "c3",
            name: "Carbon",
            description: null,
            optionGroup: "Material",
            isGroupRequired: false,
            glbObjectName: null,
            thumbnailUrl: null,
            priceModifier: 25,
            isDefault: true,
            displayOrder: 0,
            inStock: true,
          },
        ],
      });

      const result = await productsApi.getProductCustomizations("prod-1", "en");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Color");
      expect(result[0].isRequired).toBe(true);
      expect(result[0].options).toHaveLength(2);
      expect(result[1].name).toBe("Material");
      expect(result[1].isRequired).toBe(false);
      expect(result[1].options).toHaveLength(1);
    });

    it("preserves the insertion order of groups", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [
          { componentId: "c1", optionGroup: "Grip", isGroupRequired: true, name: "Rubber", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
          { componentId: "c2", optionGroup: "Color", isGroupRequired: false, name: "Black", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
          { componentId: "c3", optionGroup: "Material", isGroupRequired: true, name: "Carbon", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
        ],
      });

      const result = await productsApi.getProductCustomizations("prod-1", "en");

      expect(result.map((g) => g.name)).toEqual(["Grip", "Color", "Material"]);
    });

    it("sorts options within each group by displayOrder ascending", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [
          { componentId: "c3", name: "Blue", optionGroup: "Color", isGroupRequired: true, displayOrder: 2, priceModifier: 0, isDefault: false, inStock: true, description: null, glbObjectName: null, thumbnailUrl: null },
          { componentId: "c1", name: "Black", optionGroup: "Color", isGroupRequired: true, displayOrder: 0, priceModifier: 0, isDefault: true, inStock: true, description: null, glbObjectName: null, thumbnailUrl: null },
          { componentId: "c2", name: "Red", optionGroup: "Color", isGroupRequired: true, displayOrder: 1, priceModifier: 0, isDefault: false, inStock: true, description: null, glbObjectName: null, thumbnailUrl: null },
        ],
      });

      const result = await productsApi.getProductCustomizations("prod-1", "en");

      expect(result[0].options.map((o) => o.componentId)).toEqual([
        "c1",
        "c2",
        "c3",
      ]);
    });

    it("maps all option fields from the raw shape", async () => {
      const raw = {
        componentId: "c1",
        name: "Matte Black",
        description: "Matte finish",
        optionGroup: "Color",
        isGroupRequired: true,
        glbObjectName: "WheelBlack",
        thumbnailUrl: "https://example.com/black.jpg",
        priceModifier: 15,
        isDefault: true,
        displayOrder: 0,
        inStock: false,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: [raw] });

      const result = await productsApi.getProductCustomizations("prod-1", "en");

      expect(result[0].options[0]).toEqual({
        componentId: "c1",
        name: "Matte Black",
        description: "Matte finish",
        glbObjectName: "WheelBlack",
        thumbnailUrl: "https://example.com/black.jpg",
        priceModifier: 15,
        isDefault: true,
        displayOrder: 0,
        inStock: false,
      });
    });
  });
});
