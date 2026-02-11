"use client";

import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/types/products";

type ProductGridProps = {
  products: ProductListItem[];
  loading: boolean;
};

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-transparent bg-carbon">
      <div className="aspect-[4/3] bg-graphite" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-16 rounded bg-graphite" />
        <div className="h-5 w-3/4 rounded bg-graphite" />
        <div className="h-4 w-full rounded bg-graphite" />
        <div className="h-7 w-24 rounded bg-graphite" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const t = useTranslations("products");

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SearchX className="mb-4 size-16 text-smoke" />
        <h3 className="mb-2 text-xl font-semibold text-white">
          {t("noResults")}
        </h3>
        <p className="text-silver">
          {t("noResultsDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
