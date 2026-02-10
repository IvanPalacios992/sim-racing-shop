import { apiClient } from "@/lib/api-client";
import type {
  CategoryFilter,
  CategoryListItem,
  CategoryDetail,
  PaginatedResult,
} from "@/types/categories";

export const categoriesApi = {
  async getCategories(
    filter: CategoryFilter
  ): Promise<PaginatedResult<CategoryListItem>> {
    const params: Record<string, string | number | boolean> = {
      Page: filter.page,
      PageSize: filter.pageSize,
      Locale: filter.locale,
    };

    if (filter.isActive !== undefined) params.IsActive = filter.isActive;
    if (filter.sortBy) params.SortBy = filter.sortBy;
    if (filter.sortDescending !== undefined)
      params.SortDescending = filter.sortDescending;

    const response = await apiClient.get<PaginatedResult<CategoryListItem>>(
      "/categories",
      { params }
    );
    return response.data;
  },

  async getCategoryById(id: string, locale: string): Promise<CategoryDetail> {
    const response = await apiClient.get<CategoryDetail>(`/categories/${id}`, {
      params: { Locale: locale },
    });
    return response.data;
  },
};
