"use client";

import { useState, useEffect } from "react";
import { adminComponentsApi } from "@/lib/api/admin-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminModal from "@/components/admin/AdminModal";
import type { AdminComponentListItem } from "@/types/admin";

type Tab = "base" | "es" | "en";

interface ComponentsWithLocales {
  es: AdminComponentListItem;
  en: AdminComponentListItem | undefined;
}

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: ComponentsWithLocales;
}

interface BaseForm {
  sku: string;
  componentType: string;
  stockQuantity: string;
  minStockThreshold: string;
  leadTimeDays: string;
  weightGrams: string;
  costPrice: string;
}

const emptyBase = (): BaseForm => ({
  sku: "",
  componentType: "",
  stockQuantity: "0",
  minStockThreshold: "5",
  leadTimeDays: "7",
  weightGrams: "",
  costPrice: "",
});

export default function ComponentModal({ isOpen, onClose, onSuccess, editItem }: ComponentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState<BaseForm>(emptyBase());
  const [esName, setEsName] = useState("");
  const [esDesc, setEsDesc] = useState("");
  const [enName, setEnName] = useState("");
  const [enDesc, setEnDesc] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setActiveTab("base");

    if (editItem) {
      const { es, en } = editItem;
      setBase({
        sku: es.sku,
        componentType: es.componentType,
        stockQuantity: String(es.stockQuantity),
        minStockThreshold: "5",
        leadTimeDays: "7",
        weightGrams: es.weightGrams != null ? String(es.weightGrams) : "",
        costPrice: "",
      });
      setEsName(es.name);
      setEsDesc(es.description ?? "");
      setEnName(en?.name ?? "");
      setEnDesc(en?.description ?? "");
    } else {
      setBase(emptyBase());
      setEsName("");
      setEsDesc("");
      setEnName("");
      setEnDesc("");
    }
  }, [isOpen, editItem]);

  const handleBaseChange = (field: keyof BaseForm, value: string) =>
    setBase((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const translations = [
      esName ? { locale: "es", name: esName, description: esDesc || undefined } : null,
      enName ? { locale: "en", name: enName, description: enDesc || undefined } : null,
    ].filter(Boolean) as { locale: string; name: string; description?: string }[];

    try {
      if (!editItem) {
        await adminComponentsApi.create({
          sku: base.sku,
          componentType: base.componentType,
          stockQuantity: Number(base.stockQuantity),
          minStockThreshold: Number(base.minStockThreshold),
          leadTimeDays: Number(base.leadTimeDays),
          weightGrams: base.weightGrams ? Number(base.weightGrams) : null,
          costPrice: base.costPrice ? Number(base.costPrice) : null,
          translations,
        });
      } else {
        const id = editItem.es.id;
        await adminComponentsApi.update(id, {
          componentType: base.componentType,
          stockQuantity: Number(base.stockQuantity),
          minStockThreshold: Number(base.minStockThreshold),
          leadTimeDays: Number(base.leadTimeDays),
          weightGrams: base.weightGrams ? Number(base.weightGrams) : null,
          costPrice: base.costPrice ? Number(base.costPrice) : null,
        });
        if (translations.length > 0) {
          await adminComponentsApi.updateTranslations(id, { translations });
        }
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? (editItem ? "Error al actualizar el componente" : "Error al crear el componente"));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "base", label: "General" },
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
  ];

  const title = editItem ? "Editar componente" : "Nuevo componente";

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
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
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={base.sku}
                onChange={(e) => handleBaseChange("sku", e.target.value)}
                disabled={!!editItem}
                required
                placeholder="Ej: WHEEL-BASE-001"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="componentType">Tipo de componente *</Label>
              <Input
                id="componentType"
                value={base.componentType}
                onChange={(e) => handleBaseChange("componentType", e.target.value)}
                required
                placeholder="Ej: WheelBase, Pedals, Rim..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={base.stockQuantity}
                  onChange={(e) => handleBaseChange("stockQuantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStockThreshold">Stock mínimo</Label>
                <Input
                  id="minStockThreshold"
                  type="number"
                  min="0"
                  value={base.minStockThreshold}
                  onChange={(e) => handleBaseChange("minStockThreshold", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">Lead time (días) *</Label>
                <Input
                  id="leadTimeDays"
                  type="number"
                  min="0"
                  value={base.leadTimeDays}
                  onChange={(e) => handleBaseChange("leadTimeDays", e.target.value)}
                  required
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
              <Label htmlFor="costPrice">Precio coste (€)</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                value={base.costPrice}
                onChange={(e) => handleBaseChange("costPrice", e.target.value)}
                placeholder="Opcional"
              />
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
                value={esName}
                onChange={(e) => setEsName(e.target.value)}
                placeholder="Ej: Base de volante DD Pro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="es-desc">Descripción</Label>
              <Input
                id="es-desc"
                value={esDesc}
                onChange={(e) => setEsDesc(e.target.value)}
                placeholder="Descripción del componente"
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
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                placeholder="E.g.: DD Pro Wheel Base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="en-desc">Description</Label>
              <Input
                id="en-desc"
                value={enDesc}
                onChange={(e) => setEnDesc(e.target.value)}
                placeholder="Component description"
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
    </AdminModal>
  );
}
