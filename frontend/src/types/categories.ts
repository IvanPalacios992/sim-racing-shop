export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

export type CategoryFilter = {
  isActive?: boolean;
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

export type CategoryImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
};

export type CategoryDetail = {
  id: string;
  parentCategory: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  isActive: boolean;
  createdAt: string;
  image: CategoryImage;
};
