// Admin DTOs — matching backend models

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export interface AdminCategoryTranslationInput {
  locale: string;
  name: string;
  slug: string;
  shortDescription?: string;
}

export interface AdminCreateCategoryDto {
  parentCategory?: string | null;
  isActive: boolean;
  translations: AdminCategoryTranslationInput[];
}

export interface AdminUpdateCategoryDto {
  parentCategory?: string | null;
  isActive: boolean;
}

export interface AdminUpdateCategoryTranslationsDto {
  translations: AdminCategoryTranslationInput[];
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export interface AdminComponentListItem {
  id: string;
  sku: string;
  componentType: string;
  name: string;
  description: string | null;
  stockQuantity: number;
  inStock: boolean;
  weightGrams: number | null;
}

export interface AdminComponentTranslationInput {
  locale: string;
  name: string;
  description?: string;
}

export interface AdminCreateComponentDto {
  sku: string;
  componentType: string;
  stockQuantity: number;
  minStockThreshold: number;
  leadTimeDays: number;
  weightGrams?: number | null;
  costPrice?: number | null;
  translations: AdminComponentTranslationInput[];
}

export interface AdminUpdateComponentDto {
  componentType: string;
  stockQuantity: number;
  minStockThreshold: number;
  leadTimeDays: number;
  weightGrams?: number | null;
  costPrice?: number | null;
}

export interface AdminUpdateComponentTranslationsDto {
  translations: AdminComponentTranslationInput[];
}

export interface AdminComponentDetail {
  id: string;
  sku: string;
  componentType: string;
  stockQuantity: number;
  inStock: boolean;
  minStockThreshold: number;
  lowStock: boolean;
  leadTimeDays: number;
  weightGrams: number | null;
  costPrice: number | null;
  createdAt: string;
  updatedAt: string;
  translations: {
    id: string;
    locale: string;
    name: string;
    description: string | null;
  }[];
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export interface AdminProductTranslationInput {
  locale: string;
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface AdminCreateProductDto {
  sku: string;
  basePrice: number;
  vatRate: number;
  model3dUrl?: string | null;
  model3dSizeKb?: number | null;
  isActive: boolean;
  isCustomizable: boolean;
  baseProductionDays: number;
  weightGrams?: number | null;
  translations: AdminProductTranslationInput[];
}

export interface AdminUpdateProductDto {
  basePrice: number;
  vatRate: number;
  model3dUrl?: string | null;
  model3dSizeKb?: number | null;
  isActive: boolean;
  isCustomizable: boolean;
  baseProductionDays: number;
  weightGrams?: number | null;
}

export interface AdminUpdateProductTranslationsDto {
  translations: AdminProductTranslationInput[];
}

export interface ProductComponentOptionAdminDto {
  id: string;
  productId: string;
  componentId: string;
  componentSku: string;
  optionGroup: string;
  isGroupRequired: boolean;
  glbObjectName: string | null;
  thumbnailUrl: string | null;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

export interface UpsertProductComponentOptionDto {
  componentId: string;
  optionGroup: string;
  isGroupRequired: boolean;
  glbObjectName?: string | null;
  thumbnailUrl?: string | null;
  priceModifier: number;
  isDefault: boolean;
  displayOrder: number;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface SetProductCategoriesDto {
  categoryIds: string[];
}

// ─── PRODUCT IMAGES ───────────────────────────────────────────────────────────

export interface AdminProductImageItem {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
}

export interface AddProductImageDto {
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
}

// ─── ORDERS (ADMIN) ───────────────────────────────────────────────────────────

import type { OrderStatus, OrderDetailDto } from "@/types/orders";

export interface AdminOrderSummaryDto {
  id: string;
  orderNumber: string;
  userEmail: string | null;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface AdminOrderDetailDto extends OrderDetailDto {
  userEmail?: string | null;
}

// ─── CATEGORY IMAGES ──────────────────────────────────────────────────────────

export interface AdminCategoryImageItem {
  id: string;
  imageUrl: string;
  altText: string | null;
}

export interface SetCategoryImageDto {
  imageUrl: string;
  altText?: string | null;
}
