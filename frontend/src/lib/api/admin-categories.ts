import { apiClient } from "@/lib/api-client";
import type { CategoryListItem, CategoryDetail, PaginatedResult } from "@/types/categories";
import type {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
  AdminUpdateCategoryTranslationsDto,
} from "@/types/admin";

export const adminCategoriesApi = {
  async list(locale = "es"): Promise<CategoryListItem[]> {
    const response = await apiClient.get<PaginatedResult<CategoryListItem>>("/categories", {
      params: { Locale: locale, PageSize: 100, Page: 1 },
    });
    return response.data.items;
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
};
