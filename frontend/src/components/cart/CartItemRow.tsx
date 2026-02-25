"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { QuantitySelector } from "./QuantitySelector";
import type { CartItemDto } from "@/types/cart";

interface Props {
  item: CartItemDto;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function CartItemRow({ item, onUpdate, onRemove, isLoading }: Props) {
  const t = useTranslations("Cart");

  return (
    <div className="grid grid-cols-[120px_1fr_auto] gap-6 rounded-xl bg-obsidian p-5">
      {/* Image */}
      <div className="h-[90px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-graphite">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={120}
            height={90}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ShoppingCart className="size-8 text-silver" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm text-silver">{item.sku}</p>
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {item.selectedOptions.map((opt) => (
                <li key={opt.groupName} className="text-xs text-silver">
                  <span className="text-graphite">{opt.groupName}:</span> {opt.componentName}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1 text-sm">
            <span className="text-success">● {t("inStock")}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <QuantitySelector
            value={item.quantity}
            onIncrease={() => onUpdate(Math.min(99, item.quantity + 1))}
            onDecrease={() => onUpdate(Math.max(1, item.quantity - 1))}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={isLoading}
            className="text-sm text-error underline transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            {t("remove")}
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end justify-center">
        <span className="text-2xl font-bold text-white">€{(item.subtotal * (1 + item.vatRate / 100)).toFixed(2)}</span>
        {item.quantity > 1 && (
          <span className="mt-1 text-xs text-silver">
            €{(item.unitPrice * (1 + item.vatRate / 100)).toFixed(2)} / ud.
          </span>
        )}
      </div>
    </div>
  );
}
