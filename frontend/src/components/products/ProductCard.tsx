"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProductListItem } from "@/types/products";

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("products");

  return (
    <Link href={`/productos/${product.slug}`} className="block">
    <article className="group overflow-hidden rounded-xl border border-transparent bg-carbon transition-all duration-300 hover:-translate-y-1 hover:border-graphite hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-graphite">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl text-smoke/30">
            <svg className="size-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Customizable badge */}
        {product.isCustomizable && (
          <div className="absolute top-4 left-4 z-10">
            <span className="rounded-full bg-electric-blue px-3 py-1 text-xs font-semibold text-white">
              {t("customizableBadge")}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-obsidian/80 text-white transition-all hover:scale-110 hover:bg-racing-red"
          aria-label={t("addToWishlist")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart className="size-[18px]" />
        </button>
      </div>

      {/* Info */}
      <div className="p-6">
        <p className="mb-1 text-xs uppercase tracking-wider text-silver">
          {product.sku}
        </p>
        <h3 className="mb-3 text-lg font-semibold leading-snug text-white">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="mb-3 line-clamp-2 text-sm text-silver">
            {product.shortDescription}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">
            &euro;{product.basePrice.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
    </Link>
  );
}
