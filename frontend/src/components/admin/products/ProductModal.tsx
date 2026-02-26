"use client";

import { useState, useEffect } from "react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminModal from "@/components/admin/AdminModal";
import AdminTabBar from "@/components/admin/AdminTabBar";
import AdminFormActions from "@/components/admin/AdminFormActions";
import { generateSlug, extractApiError } from "@/components/admin/adminUtils";
import ComponentOptionsPanel from "./ComponentOptionsPanel";
import CategoryAssignPanel from "./CategoryAssignPanel";
import ProductImagesPanel from "./ProductImagesPanel";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";
import type { CategoryListItem } from "@/types/categories";

type Tab = "base" | "es" | "en" | "components" | "categories" | "images";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: ProductListItem;
  availableComponents: AdminComponentListItem[];
  availableCategories: CategoryListItem[];
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

const TRANSLATION_FIELDS: { key: keyof TranslationForm; labelEs: string; labelEn: string }[] = [
  { key: "name", labelEs: "Nombre *", labelEn: "Name *" },
  { key: "slug", labelEs: "Slug *", labelEn: "Slug *" },
  { key: "shortDescription", labelEs: "Descripción corta", labelEn: "Short description" },
  { key: "longDescription", labelEs: "Descripción larga", labelEn: "Long description" },
  { key: "metaTitle", labelEs: "Meta título (SEO)", labelEn: "Meta title (SEO)" },
  { key: "metaDescription", labelEs: "Meta descripción (SEO)", labelEn: "Meta description (SEO)" },
];

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  availableComponents,
  availableCategories,
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(false);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState<BaseForm>(emptyBase());
  const [es, setEs] = useState<TranslationForm>(emptyTranslation());
  const [en, setEn] = useState<TranslationForm>(emptyTranslation());
  const [esSlugTouched, setEsSlugTouched] = useState(false);
  const [enSlugTouched, setEnSlugTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setActiveTab("base");
    setEsSlugTouched(false);
    setEnSlugTouched(false);

    if (editItem) {
      setLoadingTranslations(true);
      adminProductsApi
        .getProductBothLocales(editItem.id)
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
    if (field === "slug") {
      setEsSlugTouched(true);
      setEs((prev) => ({ ...prev, slug: value }));
      return;
    }
    setEs((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editItem && !esSlugTouched) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleEnChange = (field: keyof TranslationForm, value: string) => {
    if (field === "slug") {
      setEnSlugTouched(true);
      setEn((prev) => ({ ...prev, slug: value }));
      return;
    }
    setEn((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editItem && !enSlugTouched) {
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
      setError(extractApiError(err) ?? (editItem ? "Error al actualizar el producto" : "Error al crear el producto"));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "base", label: "General" },
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
    ...(editItem ? [{ key: "components" as Tab, label: "Componentes" }] : []),
    ...(editItem ? [{ key: "categories" as Tab, label: "Categorías" }] : []),
    ...(editItem ? [{ key: "images" as Tab, label: "Imágenes" }] : []),
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

          <AdminTabBar tabs={tabs} activeTab={activeTab} onChange={(k) => setActiveTab(k as Tab)} />

          {activeTab !== "components" && activeTab !== "categories" && activeTab !== "images" ? (
            <form onSubmit={handleSubmit} id="product-form" className="space-y-4">
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

              {(activeTab === "es" || activeTab === "en") && (
                <div className="space-y-4">
                  {TRANSLATION_FIELDS.map(({ key, labelEs, labelEn }) => {
                    const locale = activeTab as "es" | "en";
                    const value = locale === "es" ? es[key] : en[key];
                    const handleChange = locale === "es" ? handleEsChange : handleEnChange;
                    const label = locale === "es" ? labelEs : labelEn;
                    return (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`${locale}-${key}`}>{label}</Label>
                        <Input
                          id={`${locale}-${key}`}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className={key === "slug" ? "font-mono text-sm" : ""}
                          placeholder={key === "slug" ? (locale === "es" ? "ej: volante-gt3" : "e.g.: gt3-steering-wheel") : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <AdminFormActions loading={loading} onCancel={onClose} />
            </form>
          ) : activeTab === "components" ? (
            editItem && (
              <ComponentOptionsPanel
                productId={editItem.id}
                availableComponents={availableComponents}
              />
            )
          ) : activeTab === "categories" ? (
            editItem && (
              <CategoryAssignPanel
                productId={editItem.id}
                availableCategories={availableCategories}
              />
            )
          ) : (
            editItem && <ProductImagesPanel productId={editItem.id} />
          )}
        </div>
      )}
    </AdminModal>
  );
}
