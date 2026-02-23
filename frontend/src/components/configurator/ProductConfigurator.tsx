"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, Box } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { productsApi } from "@/lib/api/products";
import { CustomizationPanel } from "./CustomizationPanel";
import type { CustomizationGroup, ProductDetail } from "@/types/products";

// Carga dinámica sin SSR: Three.js requiere entorno browser
const ConfiguratorViewer = dynamic(
  () => import("./ConfiguratorViewer").then((m) => m.ConfiguratorViewer),
  { ssr: false }
);

export type ConfiguratorSelections = Record<string, string | null>;

interface ProductConfiguratorProps {
  product: ProductDetail;
  onClose: () => void;
  /** Callback que recibe las selecciones y el precio total al confirmar */
  onAddToCart?: (selections: ConfiguratorSelections, totalPrice: number) => Promise<void>;
  isAddingToCart?: boolean;
}

export function ProductConfigurator({
  product,
  onClose,
  onAddToCart,
  isAddingToCart = false,
}: ProductConfiguratorProps) {
  const t = useTranslations("productDetail.configurator");
  const locale = useLocale();

  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar opciones de personalización
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await productsApi.getProductCustomizations(product.id, locale);
        if (cancelled) return;

        setGroups(data);

        // Inicializar selecciones con los valores por defecto
        const initial: Record<string, string | null> = {};
        for (const group of data) {
          const def = group.options.find((o) => o.isDefault && o.inStock);
          initial[group.name] = def?.componentId ?? null;
        }
        setSelections(initial);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [product.id, locale]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSelectionChange = useCallback(
    (groupName: string, componentId: string | null) => {
      setSelections((prev) => ({ ...prev, [groupName]: componentId }));
    },
    []
  );

  // Precio total = precio base con IVA + modificadores de las opciones elegidas
  const basePriceWithVat = product.basePrice * (1 + product.vatRate / 100);
  const totalPrice = basePriceWithVat + groups.reduce((sum, group) => {
    const selected = group.options.find(
      (o) => o.componentId === selections[group.name]
    );
    return sum + (selected?.priceModifier ?? 0);
  }, 0);

  // El botón de carrito se habilita cuando todos los grupos requeridos tienen selección
  const canAddToCart = groups
    .filter((g) => g.isRequired)
    .every((g) => selections[g.name] != null);

  const handleAddToCart = useCallback(async () => {
    if (!canAddToCart) return;
    await onAddToCart?.(selections, totalPrice);
    onClose();
  }, [canAddToCart, onAddToCart, selections, totalPrice, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${t("title")}: ${product.name}`}
      className="fixed inset-0 z-[200] flex flex-col bg-obsidian"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-graphite px-5 py-4">
        <div className="flex items-center gap-3">
          <Box className="size-5 text-racing-red" />
          <h2 className="text-base font-semibold text-white">
            {t("title")}: <span className="text-silver">{product.name}</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="rounded-lg p-2 text-silver transition-colors hover:bg-graphite hover:text-white"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Cuerpo: visor 3D | panel de opciones */}
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[1fr_420px]">
        {/* Visor 3D */}
        <div className="relative min-h-[40vh] bg-carbon lg:min-h-0">
          {product.model3dUrl ? (
            <ConfiguratorViewer
              modelUrl={product.model3dUrl}
              groups={groups}
              selections={selections}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div className="flex flex-col items-center gap-3 text-silver">
                <Box className="size-16 opacity-40" />
                <p className="text-sm">{t("noModel")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel de personalización */}
        <div className="flex min-h-0 flex-col border-t border-graphite lg:border-l lg:border-t-0">
          <CustomizationPanel
            groups={groups}
            selections={selections}
            onSelectionChange={handleSelectionChange}
            basePrice={basePriceWithVat}
            totalPrice={totalPrice}
            isLoading={isLoading}
            canAddToCart={canAddToCart}
            isAddingToCart={isAddingToCart}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}
