"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api/products";
import type { ProductDetail } from "@/types/products";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { ProductJsonLd } from "@/components/products/ProductJsonLd";
import { ProductConfigurator } from "@/components/configurator/ProductConfigurator";
import { useCartStore } from "@/stores/cart-store";

type Props = {
  slug: string;
};

export function ProductDetailContent({ slug }: Props) {
  const locale = useLocale();
  const t = useTranslations("productDetail");

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getProductBySlug(slug, locale);
        if (!cancelled) setProduct(data);
      } catch {
        if (!cancelled) setError(t("error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [slug, locale, t]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-obsidian py-24 text-center">
        <AlertCircle className="mb-4 size-16 text-racing-red" />
        <h3 className="mb-2 text-xl font-semibold text-white">
          {t("error")}
        </h3>
        <p className="mb-6 text-silver">{t("errorDesc")}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-racing-red text-white hover:bg-racing-red/80"
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Two-column grid: 55% media | 45% info */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55fr_45fr]">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
          <ProductInfo
            product={product}
            onCustomize={() => setConfiguratorOpen(true)}
            onAddToCart={async () => {
              setIsAddingToCart(true);
              try {
                await addItem(product.id, 1, locale, [], []);
              } finally {
                setIsAddingToCart(false);
              }
            }}
            isAddingToCart={isAddingToCart}
          />
        </div>

        {/* Specifications */}
        {product.specifications.length > 0 && (
          <ProductSpecifications
            specifications={product.specifications}
          />
        )}

        {/* Long description */}
        {product.longDescription && (
          <div className="mt-12 rounded-xl bg-carbon p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t("description")}
            </h2>
            <div className="max-w-none leading-relaxed text-silver">
              <p>{product.longDescription}</p>
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD for SEO */}
      <ProductJsonLd product={product} locale={locale} />

      {/* Editor 3D */}
      {configuratorOpen && (
        <ProductConfigurator
          product={product}
          onClose={() => setConfiguratorOpen(false)}
          isAddingToCart={isAddingToCart}
          onAddToCart={async (selections, _totalPrice, selectedOptions) => {
            const selectedComponentIds = Object.values(selections).filter(
              (id): id is string => id !== null
            );
            setIsAddingToCart(true);
            try {
              await addItem(product.id, 1, locale, selectedComponentIds, selectedOptions);
            } finally {
              setIsAddingToCart(false);
            }
          }}
        />
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55fr_45fr]">
          {/* Image skeleton */}
          <div className="animate-pulse rounded-xl bg-carbon p-8">
            <div className="aspect-square rounded-lg bg-graphite" />
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="size-16 rounded-lg bg-graphite" />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 rounded bg-graphite" />
            <div className="h-8 w-3/4 rounded bg-graphite" />
            <div className="h-6 w-24 rounded bg-graphite" />
            <div className="h-10 w-32 rounded bg-graphite" />
            <div className="h-4 w-full rounded bg-graphite" />
            <div className="h-4 w-2/3 rounded bg-graphite" />
            <div className="h-12 w-48 rounded bg-graphite" />
          </div>
        </div>
      </div>
    </div>
  );
}
