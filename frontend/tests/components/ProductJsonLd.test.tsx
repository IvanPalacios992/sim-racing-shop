import { render } from "../helpers/render";
import { ProductJsonLd } from "@/components/products/ProductJsonLd";
import {
  createMockProductDetail,
  createMockProductImage,
} from "../helpers/products";

function getJsonLd(container: HTMLElement) {
  const script = container.querySelector(
    'script[type="application/ld+json"]'
  );
  expect(script).not.toBeNull();
  return JSON.parse(script!.innerHTML);
}

describe("ProductJsonLd", () => {
  describe("schema structure", () => {
    it("renders a script tag with application/ld+json type", () => {
      const product = createMockProductDetail();
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const script = container.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).toBeInTheDocument();
    });

    it("generates valid JSON with @context and @type", () => {
      const product = createMockProductDetail();
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd["@context"]).toBe("https://schema.org");
      expect(jsonLd["@type"]).toBe("Product");
    });

    it("includes product name, sku and description", () => {
      const product = createMockProductDetail({
        name: "Test Wheel",
        sku: "TST-001",
        shortDescription: "A test product",
      });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.name).toBe("Test Wheel");
      expect(jsonLd.sku).toBe("TST-001");
      expect(jsonLd.description).toBe("A test product");
    });
  });

  describe("pricing", () => {
    it("calculates price with VAT included", () => {
      const product = createMockProductDetail({
        basePrice: 100,
        vatRate: 21,
      });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.offers.price).toBe("121.00");
      expect(jsonLd.offers.priceCurrency).toBe("EUR");
    });
  });

  describe("availability", () => {
    it("sets InStock when product is active", () => {
      const product = createMockProductDetail({ isActive: true });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.offers.availability).toBe(
        "https://schema.org/InStock"
      );
    });

    it("sets OutOfStock when product is not active", () => {
      const product = createMockProductDetail({ isActive: false });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.offers.availability).toBe(
        "https://schema.org/OutOfStock"
      );
    });
  });

  describe("images", () => {
    it("includes image URLs sorted by displayOrder", () => {
      const product = createMockProductDetail({
        images: [
          createMockProductImage({
            id: "b",
            imageUrl: "https://example.com/second.jpg",
            displayOrder: 1,
          }),
          createMockProductImage({
            id: "a",
            imageUrl: "https://example.com/first.jpg",
            displayOrder: 0,
          }),
        ],
      });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.image).toEqual([
        "https://example.com/first.jpg",
        "https://example.com/second.jpg",
      ]);
    });

    it("returns empty array when no images", () => {
      const product = createMockProductDetail({ images: [] });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.image).toEqual([]);
    });
  });

  describe("weight", () => {
    it("includes weight when weightGrams is set", () => {
      const product = createMockProductDetail({ weightGrams: 1200 });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.weight).toEqual({
        "@type": "QuantitativeValue",
        value: 1200,
        unitCode: "GRM",
      });
    });

    it("does not include weight when weightGrams is null", () => {
      const product = createMockProductDetail({ weightGrams: null });
      const { container } = render(
        <ProductJsonLd product={product} locale="en" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.weight).toBeUndefined();
    });
  });

  describe("url", () => {
    it("includes product URL with locale and slug", () => {
      const product = createMockProductDetail({
        slug: "test-wheel",
      });
      const { container } = render(
        <ProductJsonLd product={product} locale="es" />
      );

      const jsonLd = getJsonLd(container);
      expect(jsonLd.offers.url).toContain("/es/productos/test-wheel");
    });
  });
});
