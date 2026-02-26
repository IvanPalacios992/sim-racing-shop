"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductComponentOptionAdminDto, UpsertProductComponentOptionDto } from "@/types/admin";
import type { AdminComponentListItem } from "@/types/admin";

interface ComponentOptionsPanelProps {
  productId: string;
  availableComponents: AdminComponentListItem[];
}

const emptyOption = (): UpsertProductComponentOptionDto => ({
  componentId: "",
  optionGroup: "",
  isGroupRequired: false,
  glbObjectName: "",
  thumbnailUrl: "",
  priceModifier: 0,
  isDefault: false,
  displayOrder: 0,
});

export default function ComponentOptionsPanel({ productId, availableComponents }: ComponentOptionsPanelProps) {
  const [options, setOptions] = useState<ProductComponentOptionAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editOptionId, setEditOptionId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertProductComponentOptionDto>(emptyOption());
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [componentSearch, setComponentSearch] = useState("");

  useEffect(() => {
    adminProductsApi
      .getComponentOptions(productId)
      .then(setOptions)
      .catch(() => setError("Error al cargar opciones de componentes"))
      .finally(() => setLoading(false));
  }, [productId]);

  const openAddForm = () => {
    setEditOptionId(null);
    setForm(emptyOption());
    setComponentSearch("");
    setShowForm(true);
  };

  const openEditForm = (opt: ProductComponentOptionAdminDto) => {
    setEditOptionId(opt.id);
    setComponentSearch("");
    setForm({
      componentId: opt.componentId,
      optionGroup: opt.optionGroup,
      isGroupRequired: opt.isGroupRequired,
      glbObjectName: opt.glbObjectName ?? "",
      thumbnailUrl: opt.thumbnailUrl ?? "",
      priceModifier: opt.priceModifier,
      isDefault: opt.isDefault,
      displayOrder: opt.displayOrder,
    });
    setShowForm(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto: UpsertProductComponentOptionDto = {
        ...form,
        glbObjectName: form.glbObjectName || null,
        thumbnailUrl: form.thumbnailUrl || null,
      };
      if (editOptionId) {
        const updated = await adminProductsApi.updateComponentOption(productId, editOptionId, dto);
        setOptions((prev) => prev.map((o) => (o.id === editOptionId ? updated : o)));
      } else {
        const created = await adminProductsApi.addComponentOption(productId, dto);
        setOptions((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditOptionId(null);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? "Error al guardar la opción de componente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await adminProductsApi.deleteComponentOption(productId, id);
      setOptions((prev) => prev.filter((o) => o.id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-silver text-sm">Cargando opciones...</div>
      ) : (
        <>
          {options.length === 0 && !showForm && (
            <p className="text-silver text-sm">No hay opciones de componentes configuradas</p>
          )}

          {options.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-graphite text-silver text-left">
                    <th className="py-2 pr-3 font-medium">Componente</th>
                    <th className="py-2 pr-3 font-medium">Grupo</th>
                    <th className="py-2 pr-3 font-medium">Objeto GLB</th>
                    <th className="py-2 pr-3 font-medium">Precio mod.</th>
                    <th className="py-2 pr-3 font-medium">Por defecto</th>
                    <th className="py-2 pr-3 font-medium">Orden</th>
                    <th className="py-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((opt) => (
                    <tr key={opt.id} className="border-b border-graphite/50">
                      <td className="py-2 pr-3 text-pure-white font-mono">{opt.componentSku}</td>
                      <td className="py-2 pr-3 text-silver">{opt.optionGroup}</td>
                      <td className="py-2 pr-3 text-silver font-mono">{opt.glbObjectName ?? "—"}</td>
                      <td className="py-2 pr-3 text-silver">
                        {opt.priceModifier >= 0 ? "+" : ""}{opt.priceModifier}€
                      </td>
                      <td className="py-2 pr-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${opt.isDefault ? "bg-green-500/20 text-green-400" : "text-silver"}`}>
                          {opt.isDefault ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-silver">{opt.displayOrder}</td>
                      <td className="py-2">
                        {confirmDeleteId === opt.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-silver">¿Borrar?</span>
                            <Button size="xs" variant="destructive" disabled={deleting} onClick={() => handleDelete(opt.id)}>Sí</Button>
                            <Button size="xs" variant="secondary" onClick={() => setConfirmDeleteId(null)}>No</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditForm(opt)} className="p-1 text-silver hover:text-electric-blue transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setConfirmDeleteId(opt.id)} className="p-1 text-silver hover:text-racing-red transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit form */}
          {showForm ? (
            <form onSubmit={handleSaveOption} className="bg-obsidian border border-graphite rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-pure-white">
                {editOptionId ? "Editar opción" : "Añadir opción de componente"}
              </h4>

              <div className="space-y-1">
                <Label htmlFor="opt-component-search" className="text-xs">Componente *</Label>
                <Input
                  id="opt-component-search"
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  placeholder="Buscar por SKU o nombre..."
                  className="text-sm mb-1"
                />
                <select
                  id="opt-component"
                  value={form.componentId}
                  onChange={(e) => setForm((p) => ({ ...p, componentId: e.target.value }))}
                  required
                  size={6}
                  className="w-full bg-carbon border border-graphite text-pure-white text-sm rounded px-3 py-1 focus:outline-none focus:border-electric-blue"
                >
                  <option value="">— Seleccionar —</option>
                  {availableComponents
                    .filter((c) => {
                      const q = componentSearch.toLowerCase();
                      return !q || c.sku.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
                    })
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.sku} — {c.name}
                      </option>
                    ))}
                </select>
                {componentSearch && (
                  <p className="text-xs text-silver mt-1">
                    {availableComponents.filter((c) => {
                      const q = componentSearch.toLowerCase();
                      return c.sku.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
                    }).length} resultado(s)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="opt-group" className="text-xs">Grupo *</Label>
                  <Input id="opt-group" value={form.optionGroup} onChange={(e) => setForm((p) => ({ ...p, optionGroup: e.target.value }))} required placeholder="Ej: Volante" className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="opt-glb" className="text-xs">Objeto GLB</Label>
                  <Input id="opt-glb" value={form.glbObjectName ?? ""} onChange={(e) => setForm((p) => ({ ...p, glbObjectName: e.target.value }))} placeholder="Ej: Rim_Mesh" className="text-sm font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="opt-price" className="text-xs">Modificador precio (€)</Label>
                  <Input id="opt-price" type="number" step="0.01" value={form.priceModifier} onChange={(e) => setForm((p) => ({ ...p, priceModifier: Number(e.target.value) }))} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="opt-order" className="text-xs">Orden</Label>
                  <Input id="opt-order" type="number" min="0" value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} className="text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="opt-thumbnail" className="text-xs">URL miniatura</Label>
                <Input id="opt-thumbnail" value={form.thumbnailUrl ?? ""} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="https://..." className="text-sm" />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-silver cursor-pointer">
                  <input type="checkbox" checked={form.isGroupRequired} onChange={(e) => setForm((p) => ({ ...p, isGroupRequired: e.target.checked }))} className="accent-racing-red" />
                  Grupo requerido
                </label>
                <label className="flex items-center gap-2 text-sm text-silver cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="accent-racing-red" />
                  Por defecto
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => { setShowForm(false); setEditOptionId(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar opción"}
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="secondary" size="sm" onClick={openAddForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir componente
            </Button>
          )}
        </>
      )}
    </div>
  );
}
