"use client";

import { Lock, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CartDto } from "@/types/cart";
import { Button } from "../ui/button";

const FREE_SHIPPING_THRESHOLD = 100;

interface Props {
  cart: CartDto;
  isLoading?: boolean;
}

export function CartSummary({ cart, isLoading }: Props) {
  const t = useTranslations("Cart");
  const hasFreeShipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD;
  const vatRate = cart.items[0]?.vatRate ?? 0;

  return (
    <aside className="flex flex-col gap-6 rounded-xl bg-carbon p-6 lg:sticky lg:top-24">
      <h2 className="text-2xl font-bold text-white">{t("orderSummary")}</h2>

      {/* Price breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-base">
          <span className="text-silver">
            {t("subtotalLine", { count: cart.totalItems })}
          </span>
          <span className="font-semibold text-white">€{cart.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-base">
          <span className="text-silver">{t("shipping")}</span>
          {hasFreeShipping ? (
            <span className="font-semibold text-success">{t("shippingFree")}</span>
          ) : (
            <span className="font-semibold text-white">€4.99</span>
          )}
        </div>

        <div className="flex items-center justify-between text-base">
          <span className="text-silver">{t("vatLine", { rate: vatRate })}</span>
          <span className="font-semibold text-white">€{cart.vatAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-graphite pt-4 text-xl font-bold text-white">
        <span>{t("total")}</span>
        <span>€{(cart.total + (hasFreeShipping ? 0 : 4.99)).toFixed(2)}</span>
      </div>

      {/* Free shipping notice */}
      {hasFreeShipping && (
        <div className="flex items-center gap-3 rounded-lg border-l-4 border-electric-blue bg-obsidian p-4">
          <Truck className="size-6 flex-shrink-0 text-electric-blue" />
          <div>
            <p className="text-sm font-semibold text-white">{t("freeShippingTitle")}</p>
            <p className="text-xs text-silver">{t("freeShippingMessage")}</p>
          </div>
        </div>
      )}

      {/* Secure payment badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-obsidian px-4 py-3 text-sm text-silver">
        <Lock className="size-4 flex-shrink-0" />
        <span>{t("securePayment")}</span>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Button asChild variant="default" size="xxl" textSize="lg" disabled={isLoading}>
          <Link href="/checkout">{t("proceedToCheckout")}</Link>
        </Button>
        <Button asChild variant="secondary" size="xl" textSize="lg">
          <Link href="/productos">{t("continueShopping")}</Link>
        </Button>
      </div>

      {/* Payment methods */}
      <div>
        <p className="mb-3 text-sm font-semibold text-white">{t("paymentMethods")}</p>
        <div className="flex flex-wrap gap-2">
          {["Visa", "Mastercard", "PayPal", "Klarna"].map((method) => (
            <span
              key={method}
              className="rounded-lg bg-obsidian px-3 py-1.5 text-xs font-medium text-silver"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
