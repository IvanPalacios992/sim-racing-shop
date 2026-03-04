import { apiClient } from "@/lib/api-client";
import type { ProductListItem, ProductDetail } from "@/types/products";
import type { PaginatedResult } from "@/types/categories";
import type {
  AdminCreateProductDto,
  AdminUpdateProductDto,
  AdminUpdateProductTranslationsDto,
  ProductComponentOptionAdminDto,
  UpsertProductComponentOptionDto,
  ProductCategoryItem,
  SetProductCategoriesDto,
  AdminProductImageItem,
  AddProductImageDto,
} from "@/types/admin";

export const adminProductsApi = {
  async list(locale = "es", page = 1, pageSize = 10, search?: string): Promise<PaginatedResult<ProductListItem>> {
    const params: Record<string, unknown> = { Locale: locale, PageSize: pageSize, Page: page };
    if (search) params.search = search;
    const response = await apiClient.get<PaginatedResult<ProductListItem>>("/products", { params });
    return response.data;
  },

  async getProductBothLocales(id: string): Promise<{ es: ProductDetail; en: ProductDetail }> {
    const [es, en] = await Promise.all([
      apiClient.get<ProductDetail>(`/products/${id}`, { params: { locale: "es" } }),
      apiClient.get<ProductDetail>(`/products/${id}`, { params: { locale: "en" } }),
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

  async getCategories(productId: string): Promise<ProductCategoryItem[]> {
    const response = await apiClient.get<ProductCategoryItem[]>(`/admin/products/${productId}/categories`);
    return response.data;
  },

  async setCategories(productId: string, dto: SetProductCategoriesDto): Promise<ProductCategoryItem[]> {
    const response = await apiClient.put<ProductCategoryItem[]>(`/admin/products/${productId}/categories`, dto);
    return response.data;
  },

  async getImages(productId: string): Promise<AdminProductImageItem[]> {
    const response = await apiClient.get<AdminProductImageItem[]>(`/admin/products/${productId}/images`);
    return response.data;
  },

  async addImage(productId: string, dto: AddProductImageDto): Promise<AdminProductImageItem> {
    const response = await apiClient.post<AdminProductImageItem>(`/admin/products/${productId}/images/url`, dto);
    return response.data;
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },
};
