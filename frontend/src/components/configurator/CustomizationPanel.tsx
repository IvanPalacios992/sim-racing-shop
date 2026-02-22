"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupSelector } from "./GroupSelector";
import type { CustomizationGroup } from "@/types/products";

interface CustomizationPanelProps {
  groups: CustomizationGroup[];
  selections: Record<string, string | null>;
  onSelectionChange: (groupName: string, componentId: string | null) => void;
  basePrice: number;
  totalPrice: number;
  isLoading: boolean;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  onAddToCart: () => void;
}

export function CustomizationPanel({
  groups,
  selections,
  onSelectionChange,
  basePrice,
  totalPrice,
  isLoading,
  canAddToCart,
  isAddingToCart,
  onAddToCart,
}: CustomizationPanelProps) {
  const t = useTranslations("productDetail.configurator");

  const extras = totalPrice - basePrice;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <p className="text-sm text-silver">{t("loadingOptions")}</p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded bg-graphite" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 rounded-xl bg-graphite" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-silver">{t("noOptions")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Lista de grupos con scroll */}
      <div className="flex-1 overflow-y-auto p-6 [scrollbar-color:theme(colors.graphite)_theme(colors.obsidian)] [scrollbar-width:thin]">
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <GroupSelector
              key={group.name}
              group={group}
              selectedId={selections[group.name] ?? null}
              onChange={(id) => onSelectionChange(group.name, id)}
            />
          ))}
        </div>
      </div>

      {/* Footer sticky: precio + botón */}
      <div className="border-t border-graphite bg-carbon p-6">
        {/* Desglose de precio */}
        <div className="mb-4 flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between text-silver">
            <span>{t("basePrice")}</span>
            <span>€{basePrice.toFixed(2)}</span>
          </div>
          {extras > 0 && (
            <div className="flex items-center justify-between text-electric-blue">
              <span>{t("extras")}</span>
              <span>+€{extras.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between border-t border-graphite pt-2 text-base font-bold text-white">
            <span>{t("total")}</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Aviso opciones requeridas sin seleccionar */}
        {!canAddToCart && (
          <p className="mb-3 text-center text-xs text-silver">
            {t("missingRequired")}
          </p>
        )}

        <Button
          onClick={onAddToCart}
          disabled={!canAddToCart || isAddingToCart}
          className="w-full bg-racing-red text-sm font-semibold uppercase tracking-wider text-white hover:bg-racing-red/80 disabled:opacity-50"
          size="lg"
        >
          <ShoppingCart className="mr-2 size-4" />
          {t("addToCart")}
        </Button>
      </div>
    </div>
  );
}
