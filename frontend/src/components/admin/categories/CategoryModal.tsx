"use client";

import { useState, useEffect } from "react";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminModal from "@/components/admin/AdminModal";
import type { CategoryListItem } from "@/types/categories";

type Tab = "base" | "es" | "en";

interface TranslationForm {
  name: string;
  slug: string;
  shortDescription: string;
}

const emptyTranslation = (): TranslationForm => ({ name: "", slug: "", shortDescription: "" });

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: CategoryListItem;
}

export default function CategoryModal({ isOpen, onClose, onSuccess, editItem }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(false);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [es, setEs] = useState<TranslationForm>(emptyTranslation());
  const [en, setEn] = useState<TranslationForm>(emptyTranslation());

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setActiveTab("base");

    if (editItem) {
      setLoadingTranslations(true);
      adminCategoriesApi
        .getCategoryBothLocales(editItem.id)
        .then(({ es: esData, en: enData }) => {
          setIsActive(esData.isActive);
          setEs({ name: esData.name, slug: esData.slug, shortDescription: esData.shortDescription ?? "" });
          setEn({ name: enData.name, slug: enData.slug, shortDescription: enData.shortDescription ?? "" });
        })
        .catch(() => setError("Error al cargar traducciones"))
        .finally(() => setLoadingTranslations(false));
    } else {
      setIsActive(true);
      setEs(emptyTranslation());
      setEn(emptyTranslation());
    }
  }, [isOpen, editItem]);

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
        ? { locale: "es", name: es.name, slug: es.slug, shortDescription: es.shortDescription || undefined }
        : null,
      en.name && en.slug
        ? { locale: "en", name: en.name, slug: en.slug, shortDescription: en.shortDescription || undefined }
        : null,
    ].filter(Boolean) as { locale: string; name: string; slug: string; shortDescription?: string }[];

    try {
      if (!editItem) {
        await adminCategoriesApi.create({ isActive, translations });
      } else {
        await adminCategoriesApi.update(editItem.id, { isActive });
        if (translations.length > 0) {
          await adminCategoriesApi.updateTranslations(editItem.id, { translations });
        }
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? (editItem ? "Error al actualizar la categoría" : "Error al crear la categoría"));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "base", label: "General" },
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
  ];

  const title = editItem ? "Editar categoría" : "Nueva categoría";

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      {loadingTranslations ? (
        <div className="py-12 text-center text-silver">Cargando traducciones...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">{error}</div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-graphite mb-4">
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

          {/* Base tab */}
          {activeTab === "base" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-racing-red"
                />
                <Label htmlFor="isActive">Categoría activa</Label>
              </div>
            </div>
          )}

          {/* ES tab */}
          {activeTab === "es" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="es-name">Nombre *</Label>
                <Input
                  id="es-name"
                  value={es.name}
                  onChange={(e) => handleEsChange("name", e.target.value)}
                  placeholder="Ej: Volantes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="es-slug">Slug *</Label>
                <Input
                  id="es-slug"
                  value={es.slug}
                  onChange={(e) => handleEsChange("slug", e.target.value)}
                  placeholder="Ej: volantes"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="es-desc">Descripción corta</Label>
                <Input
                  id="es-desc"
                  value={es.shortDescription}
                  onChange={(e) => handleEsChange("shortDescription", e.target.value)}
                  placeholder="Descripción breve de la categoría"
                />
              </div>
            </div>
          )}

          {/* EN tab */}
          {activeTab === "en" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="en-name">Name *</Label>
                <Input
                  id="en-name"
                  value={en.name}
                  onChange={(e) => handleEnChange("name", e.target.value)}
                  placeholder="E.g.: Steering Wheels"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="en-slug">Slug *</Label>
                <Input
                  id="en-slug"
                  value={en.slug}
                  onChange={(e) => handleEnChange("slug", e.target.value)}
                  placeholder="E.g.: steering-wheels"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="en-desc">Short description</Label>
                <Input
                  id="en-desc"
                  value={en.shortDescription}
                  onChange={(e) => handleEnChange("shortDescription", e.target.value)}
                  placeholder="Brief category description"
                />
              </div>
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
      )}
    </AdminModal>
  );
}
