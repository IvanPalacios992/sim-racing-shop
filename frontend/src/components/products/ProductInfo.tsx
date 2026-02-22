"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Clock, Package, Truck, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/types/products";

type Props = {
  product: ProductDetail;
  onCustomize?: () => void;
};

export function ProductInfo({ product, onCustomize }: Props) {
  const t = useTranslations("productDetail");

  const priceWithVat = product.basePrice * (1 + product.vatRate / 100);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-sm text-silver"
      >
        <Link href="/" className="transition-colors hover:text-white">
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link
          href="/productos"
          className="transition-colors hover:text-white"
        >
          {t("breadcrumb.products")}
        </Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      {/* Product name */}
      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        {product.name}
      </h1>

      {/* SKU + customizable badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-silver">
          SKU: {product.sku}
        </span>
        {product.isCustomizable && (
          <span className="rounded-full bg-electric-blue px-3 py-1 text-xs font-semibold text-white">
            {t("customizable")}
          </span>
        )}
      </div>

      {/* Rating placeholder */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="size-4 rounded-sm bg-graphite" />
          ))}
        </div>
        <span className="text-sm text-silver">{t("noReviewsYet")}</span>
      </div>

      {/* Price */}
      <div className="space-y-1">
        <div className="text-3xl font-bold text-white">
          &euro;{priceWithVat.toFixed(2)}
        </div>
        <p className="text-sm text-silver">
          {t("priceExVat", { price: product.basePrice.toFixed(2) })}
          {" \u00B7 "}
          {t("vatIncluded", { rate: product.vatRate })}
        </p>
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {product.isActive ? (
          <>
            <div className="size-2.5 rounded-full bg-success" />
            <span className="text-sm font-medium text-success">
              {t("inStock")}
            </span>
          </>
        ) : (
          <>
            <div className="size-2.5 rounded-full bg-error" />
            <span className="text-sm font-medium text-error">
              {t("outOfStock")}
            </span>
          </>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="leading-relaxed text-silver">
          {product.shortDescription}
        </p>
      )}

      {/* Customize button */}
      {product.isCustomizable && (
        <Button
          size="lg"
          onClick={onCustomize}
          className="w-full bg-racing-red text-base font-semibold uppercase tracking-wider text-white hover:bg-racing-red/80 sm:w-auto"
        >
          {t("customize")}
        </Button>
      )}

      {/* Production time */}
      <div className="flex items-center gap-2 text-sm text-silver">
        <Clock className="size-4 shrink-0" />
        <span>
          {t("productionTime", { days: product.baseProductionDays })}
        </span>
      </div>

      {/* Weight */}
      {product.weightGrams && (
        <div className="flex items-center gap-2 text-sm text-silver">
          <Package className="size-4 shrink-0" />
          <span>{t("weight", { grams: product.weightGrams })}</span>
        </div>
      )}

      {/* Trust indicators */}
      <div className="space-y-3 rounded-xl border border-graphite p-4">
        <div className="flex items-center gap-3 text-sm text-silver">
          <Truck className="size-4 shrink-0 text-electric-blue" />
          <span>{t("trust.freeShipping")}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-silver">
          <Shield className="size-4 shrink-0 text-electric-blue" />
          <span>{t("trust.warranty")}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-silver">
          <ShieldCheck className="size-4 shrink-0 text-electric-blue" />
          <span>{t("trust.securePayment")}</span>
        </div>
      </div>
    </div>
  );
}
