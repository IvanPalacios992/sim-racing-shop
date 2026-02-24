"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/stores/cart-store";
import type { CartItemDto } from "@/types/cart";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function MiniCartItemRow({ item, onRemove }: { item: CartItemDto; onRemove: () => void }) {
  const t = useTranslations("Cart");
  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-3 rounded-lg bg-obsidian p-3">
      {/* Thumbnail */}
      <div className="size-20 flex-shrink-0 overflow-hidden rounded-lg bg-graphite">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={80}
            height={60}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ShoppingCart className="size-6 text-silver" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-semibold leading-snug text-white">{item.name}</p>
        <p className="text-xs text-silver">
          {t("quantity")}: {item.quantity}
        </p>
        <p className="font-semibold text-white">€{(item.subtotal * (1 + item.vatRate / 100)).toFixed(2)}</p>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("remove")}
        className="self-start p-1 text-silver transition-colors hover:text-error"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function MiniCart({ isOpen, onClose }: Props) {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { cart, removeItem, isLoading } = useCartStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 flex w-[380px] flex-col overflow-hidden rounded-xl border border-graphite bg-carbon shadow-2xl"
      role="dialog"
      aria-label={t("miniTitle")}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-graphite px-5 py-4">
        <h3 className="text-lg font-semibold text-white">{t("miniTitle")}</h3>
        <span className="text-sm text-silver">
          {cart?.totalItems ?? 0} {(cart?.totalItems ?? 0) === 1 ? t("articleSingular") : t("articlePlural")}
        </span>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <ShoppingCart className="mb-4 size-16 text-silver" />
          <p className="mb-4 text-silver">{t("emptyMessage")}</p>
          <Link
            href="/productos"
            onClick={onClose}
            className="rounded-lg bg-racing-red px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("exploreProducts")}
          </Link>
        </div>
      ) : (
        <>
          {/* Items list */}
          <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto p-4 [scrollbar-color:theme(colors.graphite)_theme(colors.obsidian)] [scrollbar-width:thin]">
            {items.map((item) => (
              <MiniCartItemRow
                key={item.productId}
                item={item}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-graphite p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-silver">{t("subtotalLabel")}:</span>
              <span className="text-xl font-bold text-white">€{cart!.total.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={`/carrito`}
                onClick={onClose}
                className={`flex w-full items-center justify-center rounded-lg bg-racing-red px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 ${isLoading ? "pointer-events-none opacity-60" : ""}`}
              >
                {t("viewCart")}
              </Link>
              <Link
                href={`/checkout`}
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-lg border border-graphite px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-electric-blue"
              >
                {t("checkout")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
