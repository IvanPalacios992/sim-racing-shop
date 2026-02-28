import { apiClient } from "@/lib/api-client";
import type { CategoryListItem, CategoryDetail, PaginatedResult } from "@/types/categories";
import type {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
  AdminUpdateCategoryTranslationsDto,
  AdminCategoryImageItem,
  SetCategoryImageDto,
} from "@/types/admin";

export const adminCategoriesApi = {
  async list(locale = "es", page = 1, pageSize = 10, search?: string): Promise<PaginatedResult<CategoryListItem>> {
    const params: Record<string, unknown> = { Locale: locale, PageSize: pageSize, Page: page };
    if (search) params.Search = search;
    const response = await apiClient.get<PaginatedResult<CategoryListItem>>("/categories", { params });
    return response.data;
  },

  async getCategoryBothLocales(id: string): Promise<{ es: CategoryDetail; en: CategoryDetail }> {
    const [es, en] = await Promise.all([
      apiClient.get<CategoryDetail>(`/categories/${id}`, { params: { Locale: "es" } }),
      apiClient.get<CategoryDetail>(`/categories/${id}`, { params: { Locale: "en" } }),
    ]);
    return { es: es.data, en: en.data };
  },

  async create(dto: AdminCreateCategoryDto): Promise<CategoryDetail> {
    const response = await apiClient.post<CategoryDetail>("/admin/categories", dto);
    return response.data;
  },

  async update(id: string, dto: AdminUpdateCategoryDto): Promise<CategoryDetail> {
    const response = await apiClient.put<CategoryDetail>(`/admin/categories/${id}`, dto);
    return response.data;
  },

  async updateTranslations(id: string, dto: AdminUpdateCategoryTranslationsDto): Promise<CategoryDetail> {
    const response = await apiClient.put<CategoryDetail>(`/admin/categories/${id}/translations`, dto);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  async getImage(categoryId: string): Promise<AdminCategoryImageItem | null> {
    try {
      const response = await apiClient.get<AdminCategoryImageItem>(`/admin/categories/${categoryId}/image`);
      return response.data;
    } catch {
      return null;
    }
  },

  async setImage(categoryId: string, dto: SetCategoryImageDto): Promise<AdminCategoryImageItem> {
    const response = await apiClient.put<AdminCategoryImageItem>(`/admin/categories/${categoryId}/image/url`, dto);
    return response.data;
  },

  async deleteImage(categoryId: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${categoryId}/image`);
  },
};
