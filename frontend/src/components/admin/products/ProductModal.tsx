"use client";

import { useState, useEffect } from "react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminModal from "@/components/admin/AdminModal";
import ComponentOptionsPanel from "./ComponentOptionsPanel";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";

type Tab = "base" | "es" | "en" | "components";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: ProductListItem;
  availableComponents: AdminComponentListItem[];
}

interface BaseForm {
  sku: string;
  basePrice: string;
  vatRate: string;
  model3dUrl: string;
  model3dSizeKb: string;
  isActive: boolean;
  isCustomizable: boolean;
  baseProductionDays: string;
  weightGrams: string;
}

interface TranslationForm {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
}

const emptyBase = (): BaseForm => ({
  sku: "",
  basePrice: "",
  vatRate: "21",
  model3dUrl: "",
  model3dSizeKb: "",
  isActive: true,
  isCustomizable: true,
  baseProductionDays: "7",
  weightGrams: "",
});

const emptyTranslation = (): TranslationForm => ({
  name: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  metaTitle: "",
  metaDescription: "",
});

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  availableComponents,
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(false);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState<BaseForm>(emptyBase());
  const [es, setEs] = useState<TranslationForm>(emptyTranslation());
  const [en, setEn] = useState<TranslationForm>(emptyTranslation());

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setActiveTab("base");

    if (editItem) {
      setLoadingTranslations(true);
      adminProductsApi
        .getProductBothLocales(editItem.slug)
        .then(({ es: esData, en: enData }) => {
          setBase({
            sku: esData.sku,
            basePrice: String(esData.basePrice),
            vatRate: String(esData.vatRate),
            model3dUrl: esData.model3dUrl ?? "",
            model3dSizeKb: esData.model3dSizeKb != null ? String(esData.model3dSizeKb) : "",
            isActive: esData.isActive,
            isCustomizable: esData.isCustomizable,
            baseProductionDays: String(esData.baseProductionDays),
            weightGrams: esData.weightGrams != null ? String(esData.weightGrams) : "",
          });
          setEs({
            name: esData.name,
            slug: esData.slug,
            shortDescription: esData.shortDescription ?? "",
            longDescription: esData.longDescription ?? "",
            metaTitle: esData.metaTitle ?? "",
            metaDescription: esData.metaDescription ?? "",
          });
          setEn({
            name: enData.name,
            slug: enData.slug,
            shortDescription: enData.shortDescription ?? "",
            longDescription: enData.longDescription ?? "",
            metaTitle: enData.metaTitle ?? "",
            metaDescription: enData.metaDescription ?? "",
          });
        })
        .catch(() => setError("Error al cargar traducciones"))
        .finally(() => setLoadingTranslations(false));
    } else {
      setBase(emptyBase());
      setEs(emptyTranslation());
      setEn(emptyTranslation());
    }
  }, [isOpen, editItem]);

  const handleBaseChange = (field: keyof BaseForm, value: string | boolean) =>
    setBase((prev) => ({ ...prev, [field]: value }));

  const handleEsChange = (field: keyof TranslationForm, value: string) => {
    setEs((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editItem && !prev.slug) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleEnChange = (field: keyof TranslationForm, value: string) => {
    setEn((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editItem && !prev.slug) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const translations = [
      es.name && es.slug
        ? {
            locale: "es",
            name: es.name,
            slug: es.slug,
            shortDescription: es.shortDescription || undefined,
            longDescription: es.longDescription || undefined,
            metaTitle: es.metaTitle || undefined,
            metaDescription: es.metaDescription || undefined,
          }
        : null,
      en.name && en.slug
        ? {
            locale: "en",
            name: en.name,
            slug: en.slug,
            shortDescription: en.shortDescription || undefined,
            longDescription: en.longDescription || undefined,
            metaTitle: en.metaTitle || undefined,
            metaDescription: en.metaDescription || undefined,
          }
        : null,
    ].filter(Boolean) as {
      locale: string;
      name: string;
      slug: string;
      shortDescription?: string;
      longDescription?: string;
      metaTitle?: string;
      metaDescription?: string;
    }[];

    try {
      if (!editItem) {
        await adminProductsApi.create({
          sku: base.sku,
          basePrice: Number(base.basePrice),
          vatRate: Number(base.vatRate),
          model3dUrl: base.model3dUrl || null,
          model3dSizeKb: base.model3dSizeKb ? Number(base.model3dSizeKb) : null,
          isActive: base.isActive,
          isCustomizable: base.isCustomizable,
          baseProductionDays: Number(base.baseProductionDays),
          weightGrams: base.weightGrams ? Number(base.weightGrams) : null,
          translations,
        });
      } else {
        await adminProductsApi.update(editItem.id, {
          basePrice: Number(base.basePrice),
          vatRate: Number(base.vatRate),
          model3dUrl: base.model3dUrl || null,
          model3dSizeKb: base.model3dSizeKb ? Number(base.model3dSizeKb) : null,
          isActive: base.isActive,
          isCustomizable: base.isCustomizable,
          baseProductionDays: Number(base.baseProductionDays),
          weightGrams: base.weightGrams ? Number(base.weightGrams) : null,
        });
        if (translations.length > 0) {
          await adminProductsApi.updateTranslations(editItem.id, { translations });
        }
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? (editItem ? "Error al actualizar el producto" : "Error al crear el producto"));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "base", label: "General" },
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
    ...(editItem ? [{ key: "components" as Tab, label: "Componentes" }] : []),
  ];

  const title = editItem ? "Editar producto" : "Nuevo producto";

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      {loadingTranslations ? (
        <div className="py-12 text-center text-silver">Cargando traducciones...</div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">{error}</div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap border-b border-graphite mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-racing-red text-pure-white"
                    : "border-transparent text-silver hover:text-pure-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== "components" ? (
            <form onSubmit={handleSubmit} id="product-form" className="space-y-4">
              {/* Base tab */}
              {activeTab === "base" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={base.sku}
                      onChange={(e) => handleBaseChange("sku", e.target.value)}
                      disabled={!!editItem}
                      required
                      placeholder="Ej: WHEEL-GT3-001"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Precio base (€) *</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={base.basePrice}
                        onChange={(e) => handleBaseChange("basePrice", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">IVA (%)</Label>
                      <Input
                        id="vatRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={base.vatRate}
                        onChange={(e) => handleBaseChange("vatRate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseProductionDays">Días producción</Label>
                      <Input
                        id="baseProductionDays"
                        type="number"
                        min="0"
                        value={base.baseProductionDays}
                        onChange={(e) => handleBaseChange("baseProductionDays", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightGrams">Peso (g)</Label>
                      <Input
                        id="weightGrams"
                        type="number"
                        min="0"
                        value={base.weightGrams}
                        onChange={(e) => handleBaseChange("weightGrams", e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model3dUrl">URL modelo 3D</Label>
                    <Input
                      id="model3dUrl"
                      value={base.model3dUrl}
                      onChange={(e) => handleBaseChange("model3dUrl", e.target.value)}
                      placeholder="/models/producto.glb"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model3dSizeKb">Tamaño modelo (KB)</Label>
                    <Input
                      id="model3dSizeKb"
                      type="number"
                      min="0"
                      value={base.model3dSizeKb}
                      onChange={(e) => handleBaseChange("model3dSizeKb", e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-silver cursor-pointer">
                      <input
                        type="checkbox"
                        checked={base.isActive}
                        onChange={(e) => handleBaseChange("isActive", e.target.checked)}
                        className="w-4 h-4 accent-racing-red"
                      />
                      Activo
                    </label>
                    <label className="flex items-center gap-2 text-sm text-silver cursor-pointer">
                      <input
                        type="checkbox"
                        checked={base.isCustomizable}
                        onChange={(e) => handleBaseChange("isCustomizable", e.target.checked)}
                        className="w-4 h-4 accent-racing-red"
                      />
                      Personalizable
                    </label>
                  </div>
                </div>
              )}

              {/* ES tab */}
              {activeTab === "es" && (
                <div className="space-y-4">
                  {(["name", "slug", "shortDescription", "longDescription", "metaTitle", "metaDescription"] as (keyof TranslationForm)[]).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`es-${field}`}>
                        {field === "name" ? "Nombre *" : field === "slug" ? "Slug *" : field === "shortDescription" ? "Descripción corta" : field === "longDescription" ? "Descripción larga" : field === "metaTitle" ? "Meta título (SEO)" : "Meta descripción (SEO)"}
                      </Label>
                      <Input
                        id={`es-${field}`}
                        value={es[field]}
                        onChange={(e) => handleEsChange(field, e.target.value)}
                        className={field === "slug" ? "font-mono text-sm" : ""}
                        placeholder={field === "slug" ? "ej: volante-gt3" : undefined}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* EN tab */}
              {activeTab === "en" && (
                <div className="space-y-4">
                  {(["name", "slug", "shortDescription", "longDescription", "metaTitle", "metaDescription"] as (keyof TranslationForm)[]).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`en-${field}`}>
                        {field === "name" ? "Name *" : field === "slug" ? "Slug *" : field === "shortDescription" ? "Short description" : field === "longDescription" ? "Long description" : field === "metaTitle" ? "Meta title (SEO)" : "Meta description (SEO)"}
                      </Label>
                      <Input
                        id={`en-${field}`}
                        value={en[field]}
                        onChange={(e) => handleEnChange(field, e.target.value)}
                        className={field === "slug" ? "font-mono text-sm" : ""}
                        placeholder={field === "slug" ? "e.g.: gt3-steering-wheel" : undefined}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-graphite">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          ) : (
            /* Components tab */
            editItem && (
              <ComponentOptionsPanel
                productId={editItem.id}
                availableComponents={availableComponents}
              />
            )
          )}
        </div>
      )}
    </AdminModal>
  );
}
