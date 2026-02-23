import { apiClient } from "@/lib/api-client";
import type {
  ProductFilter,
  ProductListItem,
  ProductDetail,
  PaginatedResult,
  CustomizationGroup,
  CustomizationOption,
} from "@/types/products";

/** Shape devuelta por GET /api/components/product/{id} */
type RawComponentOption = {
  componentId: string;
  name: string;
  description: string | null;
  optionGroup: string;
  isGroupRequired: boolean;
  glbObjectName: string | null;
  thumbnailUrl: string | null;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
  inStock: boolean;
};

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
    if (filter.categorySlug) params.CategorySlug = filter.categorySlug;
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

  async getProductCustomizations(
    productId: string,
    locale: string
  ): Promise<CustomizationGroup[]> {
    const response = await apiClient.get<RawComponentOption[]>(
      `/components/product/${productId}`,
      { params: { locale } }
    );

    // Agrupar la lista plana por optionGroup manteniendo el orden de displayOrder
    const groupMap = new Map<string, CustomizationGroup>();

    for (const raw of response.data) {
      if (!groupMap.has(raw.optionGroup)) {
        groupMap.set(raw.optionGroup, {
          name: raw.optionGroup,
          isRequired: raw.isGroupRequired,
          options: [],
        });
      }
      const option: CustomizationOption = {
        componentId: raw.componentId,
        name: raw.name,
        description: raw.description,
        glbObjectName: raw.glbObjectName,
        thumbnailUrl: raw.thumbnailUrl,
        priceModifier: raw.priceModifier,
        isDefault: raw.isDefault,
        displayOrder: raw.displayOrder,
        inStock: raw.inStock,
      };
      groupMap.get(raw.optionGroup)!.options.push(option);
    }

    // Ordenar opciones de cada grupo por displayOrder
    return Array.from(groupMap.values()).map((g) => ({
      ...g,
      options: g.options.sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  },
};
