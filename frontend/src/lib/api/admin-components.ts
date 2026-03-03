import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/categories";
import type {
  AdminComponentListItem,
  AdminCreateComponentDto,
  AdminUpdateComponentDto,
  AdminUpdateComponentTranslationsDto,
  AdminComponentDetail,
} from "@/types/admin";

export const adminComponentsApi = {
  async list(locale = "es", page = 1, pageSize = 10, search?: string): Promise<PaginatedResult<AdminComponentListItem>> {
    const params: Record<string, unknown> = { Locale: locale, PageSize: pageSize, Page: page };
    if (search) params.Search = search;
    const response = await apiClient.get<PaginatedResult<AdminComponentListItem>>("/components", { params });
    return response.data;
  },

  async create(dto: AdminCreateComponentDto): Promise<AdminComponentDetail> {
    const response = await apiClient.post<AdminComponentDetail>("/admin/components", dto);
    return response.data;
  },

  async update(id: string, dto: AdminUpdateComponentDto): Promise<AdminComponentDetail> {
    const response = await apiClient.put<AdminComponentDetail>(`/admin/components/${id}`, dto);
    return response.data;
  },

  async updateTranslations(id: string, dto: AdminUpdateComponentTranslationsDto): Promise<AdminComponentDetail> {
    const response = await apiClient.put<AdminComponentDetail>(`/admin/components/${id}/translations`, dto);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/components/${id}`);
  },
};
