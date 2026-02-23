import type {
  ProductDetail,
  ProductImage,
  ProductSpecification,
  ProductListItem,
} from "@/types/products";

export function createMockProductImage(
  overrides?: Partial<ProductImage>
): ProductImage {
  return {
    id: "img-1",
    imageUrl: "https://example.com/image1.jpg",
    altText: "Product image",
    displayOrder: 0,
    ...overrides,
  };
}

export function createMockProductSpecification(
  overrides?: Partial<ProductSpecification>
): ProductSpecification {
  return {
    specKey: "Material",
    specValue: "Carbon Fiber",
    displayOrder: 0,
    ...overrides,
  };
}

export function createMockProductListItem(
  overrides?: Partial<ProductListItem>
): ProductListItem {
  return {
    id: "prod-123",
    sku: "WHL-F-V25",
    name: "Formula V2.5 Steering Wheel",
    slug: "formula-v25-steering-wheel",
    shortDescription: "Premium sim racing steering wheel",
    basePrice: 349.99,
    vatRate: 21,
    imageUrl: "https://example.com/image1.jpg",
    isActive: true,
    isCustomizable: true,
    ...overrides,
  };
}

export function createMockProductDetail(
  overrides?: Partial<ProductDetail>
): ProductDetail {
  return {
    id: "prod-123",
    sku: "WHL-F-V25",
    name: "Formula V2.5 Steering Wheel",
    slug: "formula-v25-steering-wheel",
    shortDescription: "Premium sim racing steering wheel",
    longDescription:
      "A high-end Formula-style steering wheel designed for competitive sim racing.",
    basePrice: 349.99,
    vatRate: 21,
    metaTitle: "Formula V2.5 | SimRacing Shop",
    metaDescription: "Premium Formula-style steering wheel for sim racing",
    model3dUrl: null,
    model3dSizeKb: null,
    isActive: true,
    isCustomizable: true,
    baseProductionDays: 7,
    weightGrams: 1200,
    createdAt: "2025-01-15T10:00:00Z",
    images: [
      createMockProductImage({
        id: "img-1",
        imageUrl: "https://example.com/image1.jpg",
        altText: "Front view",
        displayOrder: 0,
      }),
      createMockProductImage({
        id: "img-2",
        imageUrl: "https://example.com/image2.jpg",
        altText: "Side view",
        displayOrder: 1,
      }),
      createMockProductImage({
        id: "img-3",
        imageUrl: "https://example.com/image3.jpg",
        altText: "Back view",
        displayOrder: 2,
      }),
    ],
    specifications: [
      createMockProductSpecification({
        specKey: "Material",
        specValue: "Carbon Fiber",
        displayOrder: 0,
      }),
      createMockProductSpecification({
        specKey: "Diameter",
        specValue: "270mm",
        displayOrder: 1,
      }),
      createMockProductSpecification({
        specKey: "Weight",
        specValue: "1.2kg",
        displayOrder: 2,
      }),
    ],
    ...overrides,
  };
}
