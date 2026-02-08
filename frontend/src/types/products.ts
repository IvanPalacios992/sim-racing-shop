export type ProductListItem = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  vatRate: number;
  imageUrl: string | null;
  isActive: boolean;
  isCustomizable: boolean;
};

export type ProductFilter = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isCustomizable?: boolean;
  locale: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
