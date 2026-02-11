import { apiClient } from "@/lib/api-client";
import type {
  ProductFilter,
  ProductListItem,
  ProductDetail,
  PaginatedResult,
} from "@/types/products";

export const productsApi = {
  async getProducts(
    filter: ProductFilter
  ): Promise<PaginatedResult<ProductListItem>> {
    const params: Record<string, string | number | boolean> = {
      Page: filter.page,
      PageSize: filter.pageSize,
      Locale: filter.locale,
    };

    if (filter.search) params.Search = filter.search;
    if (filter.minPrice !== undefined) params.MinPrice = filter.minPrice;
    if (filter.maxPrice !== undefined) params.MaxPrice = filter.maxPrice;
    if (filter.isCustomizable !== undefined)
      params.IsCustomizable = filter.isCustomizable;
    if (filter.sortBy) params.SortBy = filter.sortBy;
    if (filter.sortDescending !== undefined)
      params.SortDescending = filter.sortDescending;

    const response = await apiClient.get<PaginatedResult<ProductListItem>>(
      "/products",
      { params }
    );
    return response.data;
  },

  async getProductBySlug(
    slug: string,
    locale: string
  ): Promise<ProductDetail> {
    const response = await apiClient.get<ProductDetail>(
      `/products/slug/${slug}`,
      { params: { Locale: locale } }
    );
    return response.data;
  },
};
