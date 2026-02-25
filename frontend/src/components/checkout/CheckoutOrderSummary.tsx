"use client";

import { Lock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CartDto } from "@/types/cart";
import type { ShippingCalculationDto } from "@/types/shipping";

interface Props {
  cart: CartDto;
  shipping: ShippingCalculationDto | null;
  shippingLoading: boolean;
  placing: boolean;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onPlaceOrder: () => void;
  error: string | null;
}

export default function CheckoutOrderSummary({
  cart,
  shipping,
  shippingLoading,
  placing,
  termsAccepted,
  onTermsChange,
  onPlaceOrder,
  error,
}: Props) {
  const t = useTranslations("Checkout");
  const vatRate = cart.items[0]?.vatRate ?? 21;
  const shippingCost = shipping
    ? shipping.isFreeShipping
      ? 0
      : shipping.totalCost
    : null;
  const total =
    shippingCost !== null ? cart.total + shippingCost : cart.total;

  return (
    <aside className="flex flex-col gap-5 rounded-xl bg-carbon p-6 lg:sticky lg:top-24">
      <h2 className="text-xl font-bold text-white">{t("orderSummary")}</h2>

      {/* Items */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              />
            )}
            {!item.imageUrl && (
              <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-obsidian" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-white">{item.name}</p>
              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <ul className="mt-0.5 space-y-px">
                  {item.selectedOptions.map((opt) => (
                    <li key={opt.groupName} className="truncate text-xs text-silver">
                      <span className="text-graphite">{opt.groupName}:</span> {opt.componentName}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-silver">
                {item.quantity} × €{item.unitPrice.toFixed(2)}
              </p>
            </div>
            <span className="text-sm font-semibold text-white">
              €{item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-graphite" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-silver">{t("subtotal", { count: cart.totalItems })}</span>
          <span className="font-semibold text-white">€{cart.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-silver">{t("shipping")}</span>
          {shippingLoading ? (
            <span className="text-silver">{t("shippingCalculating")}</span>
          ) : shippingCost === null ? (
            <span className="text-silver">—</span>
          ) : shippingCost === 0 ? (
            <span className="font-semibold text-success">{t("shippingFree")}</span>
          ) : (
            <span className="font-semibold text-white">€{shippingCost.toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-silver">{t("vat", { rate: vatRate })}</span>
          <span className="font-semibold text-white">€{cart.vatAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-graphite pt-3 text-lg font-bold text-white">
        <span>{t("total")}</span>
        <span>€{total.toFixed(2)}</span>
      </div>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-0.5 accent-racing-red"
        />
        <span className="text-xs text-silver">{t("termsAccept")}</span>
      </label>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-error/10 border border-error px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}

      {/* Place order button */}
      <Button
        type="button"
        variant="default"
        size="xxl"
        disabled={placing || !termsAccepted}
        onClick={onPlaceOrder}
        className="w-full"
      >
        {placing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("placing")}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            {t("placeOrder")}
          </span>
        )}
      </Button>

      {/* Secure badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-obsidian px-4 py-3 text-xs text-silver">
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{t("secureCheckout")}</span>
      </div>
    </aside>
  );
}
