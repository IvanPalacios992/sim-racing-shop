"use client";

import { useState, useEffect } from "react";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminCategoryImageItem } from "@/types/admin";

interface Props {
  categoryId: string;
}

export default function CategoryImagePanel({ categoryId }: Props) {
  const [image, setImage] = useState<AdminCategoryImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminCategoriesApi
      .getImage(categoryId)
      .then(setImage)
      .catch(() => setError("Error al cargar la imagen"))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await adminCategoriesApi.setImage(categoryId, {
        imageUrl: newUrl.trim(),
        altText: newAlt.trim() || null,
      });
      setImage(saved);
      setNewUrl("");
      setNewAlt("");
    } catch {
      setSaveError("Error al guardar la imagen");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminCategoriesApi.deleteImage(categoryId);
      setImage(null);
    } catch {
      setError("Error al eliminar la imagen");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-silver text-sm">Cargando imagen...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-error text-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current image */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-silver">Imagen actual</p>
        {image ? (
          <div className="flex items-center gap-3 rounded-lg border border-graphite bg-carbon px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-mono truncate" title={image.imageUrl}>
                {image.imageUrl}
              </p>
              {image.altText && (
                <p className="text-xs text-silver truncate">{image.altText}</p>
              )}
            </div>

            {confirmDelete ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-silver">¿Eliminar?</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="h-7 px-2 text-xs"
                >
                  Sí
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  className="h-7 px-2 text-xs"
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                title="Eliminar"
                onClick={() => setConfirmDelete(true)}
                className="h-7 w-7 p-0 text-silver hover:text-error shrink-0"
              >
                ✕
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-silver/60 italic">Sin imagen asignada</p>
        )}
      </div>

      {/* Set / replace image form */}
      <form onSubmit={handleSave} className="space-y-3 border-t border-graphite pt-4">
        <p className="text-sm font-medium text-silver">
          {image ? "Reemplazar imagen" : "Añadir imagen por URL"}
        </p>
        {saveError && (
          <div className="p-2 bg-error/10 border border-error rounded text-error text-xs">{saveError}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="cat-img-url">URL de la imagen *</Label>
          <Input
            id="cat-img-url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            required
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-img-alt">Texto alternativo (alt)</Label>
          <Input
            id="cat-img-alt"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            placeholder="Descripción de la imagen"
          />
        </div>
        <Button
          type="submit"
          disabled={saving || !newUrl.trim()}
          className="bg-racing-red text-white hover:bg-racing-red/80"
        >
          {saving ? "Guardando..." : image ? "Reemplazar imagen" : "Guardar imagen"}
        </Button>
      </form>
    </div>
  );
}
