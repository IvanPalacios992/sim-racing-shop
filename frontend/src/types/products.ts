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
  categorySlug?: string;
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

export type ProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
};

export type ProductSpecification = {
  specKey: string;
  specValue: string;
  displayOrder: number;
};

export type CustomizationOption = {
  componentId: string;
  name: string;
  description: string | null;
  glbObjectName: string | null;
  thumbnailUrl: string | null;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
  inStock: boolean;
};

export type CustomizationGroup = {
  /** Valor de OptionGroup, usado como clave de selección */
  name: string;
  isRequired: boolean;
  options: CustomizationOption[];
};

export type ProductDetail = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  basePrice: number;
  vatRate: number;
  metaTitle: string | null;
  metaDescription: string | null;
  model3dUrl: string | null;
  model3dSizeKb: number | null;
  isActive: boolean;
  isCustomizable: boolean;
  baseProductionDays: number;
  weightGrams: number | null;
  createdAt: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
};
