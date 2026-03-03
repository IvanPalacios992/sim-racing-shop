import { adminCategoriesApi } from "@/lib/api/admin-categories";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };

const mockCategory = {
  id: "cat-1",
  name: "Volantes",
  slug: "volantes",
  isActive: true,
  shortDescription: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("adminCategoriesApi", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── list ──────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("calls GET /categories with Locale, PageSize and Page params", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminCategoriesApi.list("es");

      expect(apiClient.get).toHaveBeenCalledWith("/categories", {
        params: { Locale: "es", PageSize: 10, Page: 1 },
      });
    });

    it("uses 'es' as default locale", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminCategoriesApi.list();

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params.Locale).toBe("es");
    });

    it("returns the paginated result object", async () => {
      const paginated = { ...emptyPaginated, items: [mockCategory], totalCount: 1, totalPages: 1 };
      vi.mocked(apiClient.get).mockResolvedValue({ data: paginated });

      const result = await adminCategoriesApi.list("es");

      expect(result).toEqual(paginated);
    });
  });

  // ── getCategoryBothLocales ─────────────────────────────────────────────────

  describe("getCategoryBothLocales", () => {
    it("calls GET /categories/{id} twice with different locales", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategory });

      await adminCategoriesApi.getCategoryBothLocales("cat-1");

      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith("/categories/cat-1", { params: { Locale: "es" } });
      expect(apiClient.get).toHaveBeenCalledWith("/categories/cat-1", { params: { Locale: "en" } });
    });

    it("returns { es, en } with response data", async () => {
      const esData = { ...mockCategory, name: "Volantes" };
      const enData = { ...mockCategory, name: "Steering Wheels", slug: "steering-wheels" };
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: esData })
        .mockResolvedValueOnce({ data: enData });

      const result = await adminCategoriesApi.getCategoryBothLocales("cat-1");

      expect(result.es).toEqual(esData);
      expect(result.en).toEqual(enData);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("calls POST /admin/categories with the dto", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCategory });

      const dto = {
        isActive: true,
        translations: [{ locale: "es", name: "Volantes", slug: "volantes" }],
      };
      await adminCategoriesApi.create(dto);

      expect(apiClient.post).toHaveBeenCalledWith("/admin/categories", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCategory });

      const result = await adminCategoriesApi.create({ isActive: true, translations: [] });

      expect(result).toEqual(mockCategory);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("calls PUT /admin/categories/{id} with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategory });

      const dto = { isActive: false };
      await adminCategoriesApi.update("cat-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/categories/cat-1", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategory });

      const result = await adminCategoriesApi.update("cat-1", { isActive: true });

      expect(result).toEqual(mockCategory);
    });
  });

  // ── updateTranslations ────────────────────────────────────────────────────

  describe("updateTranslations", () => {
    it("calls PUT /admin/categories/{id}/translations with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategory });

      const dto = {
        translations: [{ locale: "en", name: "Steering Wheels", slug: "steering-wheels" }],
      };
      await adminCategoriesApi.updateTranslations("cat-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/categories/cat-1/translations", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCategory });

      const result = await adminCategoriesApi.updateTranslations("cat-1", { translations: [] });

      expect(result).toEqual(mockCategory);
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("calls DELETE /admin/categories/{id}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await adminCategoriesApi.delete("cat-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/admin/categories/cat-1");
    });

    it("resolves without returning a value", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await adminCategoriesApi.delete("cat-1");

      expect(result).toBeUndefined();
    });
  });

  // ── list with search ──────────────────────────────────────────────────────

  describe("list (search)", () => {
    it("includes Search param when search is provided", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminCategoriesApi.list("es", 1, 10, "volantes");

      expect(apiClient.get).toHaveBeenCalledWith("/categories", {
        params: { Locale: "es", PageSize: 10, Page: 1, Search: "volantes" },
      });
    });

    it("omits Search param when search is undefined", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyPaginated });

      await adminCategoriesApi.list("es", 1, 10);

      const [, opts] = vi.mocked(apiClient.get).mock.calls[0];
      expect((opts as { params: Record<string, unknown> }).params).not.toHaveProperty("Search");
    });
  });

  // ── getImage ──────────────────────────────────────────────────────────────

  describe("getImage", () => {
    const mockImage = { id: "img-1", url: "https://example.com/cat.webp", altText: null };

    it("calls GET /admin/categories/{id}/image", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockImage });

      await adminCategoriesApi.getImage("cat-1");

      expect(apiClient.get).toHaveBeenCalledWith("/admin/categories/cat-1/image");
    });

    it("returns the image data on success", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockImage });

      const result = await adminCategoriesApi.getImage("cat-1");

      expect(result).toEqual(mockImage);
    });

    it("returns null when the request throws", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Not Found"));

      const result = await adminCategoriesApi.getImage("cat-1");

      expect(result).toBeNull();
    });
  });

  // ── setImage ──────────────────────────────────────────────────────────────

  describe("setImage", () => {
    const mockImage = { id: "img-1", url: "https://example.com/cat.webp", altText: null };

    it("calls PUT /admin/categories/{id}/image/url with the dto", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockImage });

      const dto = { url: "https://example.com/cat.webp", altText: null };
      await adminCategoriesApi.setImage("cat-1", dto);

      expect(apiClient.put).toHaveBeenCalledWith("/admin/categories/cat-1/image/url", dto);
    });

    it("returns response.data", async () => {
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockImage });

      const result = await adminCategoriesApi.setImage("cat-1", { url: "https://example.com/cat.webp", altText: null });

      expect(result).toEqual(mockImage);
    });
  });

  // ── deleteImage ───────────────────────────────────────────────────────────

  describe("deleteImage", () => {
    it("calls DELETE /admin/categories/{id}/image", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await adminCategoriesApi.deleteImage("cat-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/admin/categories/cat-1/image");
    });

    it("resolves without returning a value", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      const result = await adminCategoriesApi.deleteImage("cat-1");

      expect(result).toBeUndefined();
    });
  });
});
