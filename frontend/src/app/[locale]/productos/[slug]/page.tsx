import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { productsApi } from "@/lib/api/products";
import { ProductDetailContent } from "./ProductDetailContent";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const product = await productsApi.getProductBySlug(slug, locale);
    return {
      title: product.metaTitle || product.name,
      description:
        product.metaDescription || product.shortDescription || "",
      openGraph: {
        title: product.metaTitle || product.name,
        description:
          product.metaDescription || product.shortDescription || "",
        images:
          product.images.length > 0
            ? [
                {
                  url: product.images[0].imageUrl,
                  alt: product.images[0].altText || product.name,
                },
              ]
            : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ProductDetailContent slug={slug} />
    </Suspense>
  );
}
