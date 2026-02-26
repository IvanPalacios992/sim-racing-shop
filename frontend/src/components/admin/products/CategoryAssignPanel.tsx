"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductCategoryItem } from "@/types/admin";
import type { CategoryListItem } from "@/types/categories";

interface CategoryAssignPanelProps {
  productId: string;
  availableCategories: CategoryListItem[];
}

export default function CategoryAssignPanel({ productId, availableCategories }: CategoryAssignPanelProps) {
  const [assigned, setAssigned] = useState<ProductCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminProductsApi
      .getCategories(productId)
      .then(setAssigned)
      .catch(() => setError("Error al cargar categorías"))
      .finally(() => setLoading(false));
  }, [productId]);

  const assignedIds = new Set(assigned.map((c) => c.id));

  const unassigned = availableCategories.filter(
    (c) => !assignedIds.has(c.id) && c.isActive
  );

  const filtered = unassigned.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  const handleAdd = async (category: CategoryListItem) => {
    setSaving(true);
    setError(null);
    const newIds = [...assignedIds, category.id];
    try {
      const result = await adminProductsApi.setCategories(productId, { categoryIds: newIds });
      setAssigned(result);
    } catch {
      setError("Error al asignar la categoría");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (categoryId: string) => {
    setSaving(true);
    setError(null);
    const newIds = [...assignedIds].filter((id) => id !== categoryId);
    try {
      const result = await adminProductsApi.setCategories(productId, { categoryIds: newIds });
      setAssigned(result);
    } catch {
      setError("Error al quitar la categoría");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-silver text-sm">Cargando categorías...</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">{error}</div>
      )}

      <div>
        <p className="text-xs text-silver mb-2 font-medium uppercase tracking-wide">Categorías asignadas</p>
        {assigned.length === 0 ? (
          <p className="text-silver text-sm">Sin categorías asignadas</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assigned.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-electric-blue/10 border border-electric-blue/30 rounded-full text-sm text-electric-blue"
              >
                {cat.name}
                <button
                  onClick={() => handleRemove(cat.id)}
                  disabled={saving}
                  className="hover:text-racing-red transition-colors disabled:opacity-50"
                  aria-label={`Quitar ${cat.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-graphite pt-4">
        <p className="text-xs text-silver mb-2 font-medium uppercase tracking-wide">Añadir categoría</p>
        {unassigned.length === 0 ? (
          <p className="text-silver text-sm">No hay más categorías disponibles</p>
        ) : (
          <div className="space-y-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="text-sm"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-silver text-xs py-2">Sin resultados</p>
              ) : (
                filtered.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-obsidian/50 transition-colors"
                  >
                    <div>
                      <span className="text-sm text-pure-white">{cat.name}</span>
                      <span className="text-xs text-silver ml-2 font-mono">{cat.slug}</span>
                    </div>
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      disabled={saving}
                      onClick={() => handleAdd(cat)}
                    >
                      Añadir
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
