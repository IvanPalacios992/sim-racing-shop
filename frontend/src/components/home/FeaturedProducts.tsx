"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { productsApi } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductListItem } from "@/types/products";

export function FeaturedProducts() {
  const t = useTranslations("home.products");
  const locale = useLocale();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await productsApi.getProducts({
          locale,
          page: 1,
          pageSize: 4,
          isCustomizable: true,
        });
        setProducts(result.items);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [locale]);

  if (loading) {
    return (
      <section className="bg-carbon px-6 py-24">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
          {t("title")}
        </h2>
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl bg-graphite"
            >
              <div className="aspect-[4/3] bg-smoke" />
              <div className="space-y-3 p-6">
                <div className="h-4 w-1/3 rounded bg-smoke" />
                <div className="h-6 w-full rounded bg-smoke" />
                <div className="h-4 w-2/3 rounded bg-smoke" />
                <div className="h-8 w-1/2 rounded bg-smoke" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-carbon px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
        {t("title")}
      </h2>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
