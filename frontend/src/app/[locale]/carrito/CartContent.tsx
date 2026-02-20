"use client";

import { useEffect } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cart-store";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";

export default function CartContent() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart, _hasHydrated } =
    useCartStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    fetchCart(locale);
  }, [_hasHydrated, locale, fetchCart]);

  const items = cart?.items ?? [];
  const isEmpty = !isLoading && items.length === 0;

  return (
    <main className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-silver">
          <Link href="/" className="transition-colors hover:text-white">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-white">{t("breadcrumbCart")}</span>
        </nav>

        <h1 className="mb-10 text-4xl font-bold text-white">{t("title")}</h1>

        {/* Loading skeleton */}
        {isLoading && items.length === 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-[140px] animate-pulse rounded-xl bg-carbon" />
              ))}
            </div>
            <div className="h-[400px] animate-pulse rounded-xl bg-carbon" />
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center py-24 text-center">
            <ShoppingCart className="mb-6 size-20 text-silver" />
            <h2 className="mb-3 text-2xl font-bold text-white">{t("empty")}</h2>
            <p className="mb-8 max-w-md text-silver">{t("emptyMessage")}</p>
            <Link
              href="/productos"
              className="rounded-lg bg-racing-red px-8 py-3 font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              {t("exploreProducts")}
            </Link>
          </div>
        )}

        {/* Cart layout */}
        {!isLoading && items.length > 0 && cart && (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Items section */}
            <section className="rounded-xl bg-carbon p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  {t("itemsTitle", { count: cart.totalItems })}
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-sm text-silver transition-colors hover:text-error disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                  {t("clearCart")}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    isLoading={isLoading}
                    onUpdate={(qty) => updateItem(item.productId, qty, locale)}
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
              </div>
            </section>

            {/* Summary sidebar */}
            <CartSummary cart={cart} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}
