import { apiClient } from "@/lib/api-client";
import type { ProductListItem, ProductDetail } from "@/types/products";
import type { PaginatedResult } from "@/types/categories";
import type {
  AdminCreateProductDto,
  AdminUpdateProductDto,
  AdminUpdateProductTranslationsDto,
  ProductComponentOptionAdminDto,
  UpsertProductComponentOptionDto,
} from "@/types/admin";

export const adminProductsApi = {
  async list(locale = "es"): Promise<ProductListItem[]> {
    const response = await apiClient.get<PaginatedResult<ProductListItem>>("/products", {
      params: { Locale: locale, PageSize: 100, Page: 1 },
    });
    return response.data.items;
  },

  async getProductBothLocales(slug: string): Promise<{ es: ProductDetail; en: ProductDetail }> {
    const [es, en] = await Promise.all([
      apiClient.get<ProductDetail>(`/products/slug/${slug}`, { params: { Locale: "es" } }),
      apiClient.get<ProductDetail>(`/products/slug/${slug}`, { params: { Locale: "en" } }),
    ]);
    return { es: es.data, en: en.data };
  },

  async create(dto: AdminCreateProductDto): Promise<ProductDetail> {
    const response = await apiClient.post<ProductDetail>("/admin/products", dto);
    return response.data;
  },

  async update(id: string, dto: AdminUpdateProductDto): Promise<ProductDetail> {
    const response = await apiClient.put<ProductDetail>(`/admin/products/${id}`, dto);
    return response.data;
  },

  async updateTranslations(id: string, dto: AdminUpdateProductTranslationsDto): Promise<ProductDetail> {
    const response = await apiClient.put<ProductDetail>(`/admin/products/${id}/translations`, dto);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  },

  async getComponentOptions(id: string): Promise<ProductComponentOptionAdminDto[]> {
    const response = await apiClient.get<ProductComponentOptionAdminDto[]>(
      `/admin/products/${id}/component-options`
    );
    return response.data;
  },

  async addComponentOption(
    id: string,
    dto: UpsertProductComponentOptionDto
  ): Promise<ProductComponentOptionAdminDto> {
    const response = await apiClient.post<ProductComponentOptionAdminDto>(
      `/admin/products/${id}/component-options`,
      dto
    );
    return response.data;
  },

  async updateComponentOption(
    id: string,
    optionId: string,
    dto: UpsertProductComponentOptionDto
  ): Promise<ProductComponentOptionAdminDto> {
    const response = await apiClient.put<ProductComponentOptionAdminDto>(
      `/admin/products/${id}/component-options/${optionId}`,
      dto
    );
    return response.data;
  },

  async deleteComponentOption(id: string, optionId: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}/component-options/${optionId}`);
  },
};
