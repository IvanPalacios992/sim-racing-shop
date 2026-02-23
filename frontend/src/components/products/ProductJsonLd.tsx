import type { ProductDetail } from "@/types/products";

type Props = {
  product: ProductDetail;
  locale: string;
};

export function ProductJsonLd({ product, locale }: Props) {
  const priceWithVat = product.basePrice * (1 + product.vatRate / 100);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription || product.longDescription || "",
    sku: product.sku,
    image: [...product.images]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => img.imageUrl),
    offers: {
      "@type": "Offer",
      price: priceWithVat.toFixed(2),
      priceCurrency: "EUR",
      availability: product.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}/productos/${product.slug}`,
    },
    ...(product.weightGrams && {
      weight: {
        "@type": "QuantitativeValue",
        value: product.weightGrams,
        unitCode: "GRM",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
