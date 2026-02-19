"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cart-store";

const TOAST_DURATION_MS = 3500;

export function CartToast() {
  const t = useTranslations("Cart");
  const { lastAddedItem, clearNotification } = useCartStore();

  useEffect(() => {
    if (!lastAddedItem) return;
    const timer = setTimeout(clearNotification, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [lastAddedItem, clearNotification]);

  if (!lastAddedItem) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-graphite bg-carbon px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
    >
      <CheckCircle className="size-5 flex-shrink-0 text-success" />
      <p className="text-sm text-white">
        <span className="font-semibold">{lastAddedItem}</span>{" "}
        {t("addedToCart")}
      </p>
      <button
        type="button"
        onClick={clearNotification}
        aria-label="Cerrar"
        className="ml-auto text-silver transition-colors hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
