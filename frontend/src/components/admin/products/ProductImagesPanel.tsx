"use client";

import { useState, useEffect } from "react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProductImageItem } from "@/types/admin";

interface Props {
  productId: string;
}

export default function ProductImagesPanel({ productId }: Props) {
  const [images, setImages] = useState<AdminProductImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminProductsApi
      .getImages(productId)
      .then(setImages)
      .catch(() => setError("Error al cargar imágenes"))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const saved = await adminProductsApi.addImage(productId, {
        imageUrl: newUrl.trim(),
        altText: newAlt.trim() || null,
        displayOrder: images.length,
      });
      setImages((prev) => [...prev, saved]);
      setNewUrl("");
      setNewAlt("");
    } catch {
      setAddError("Error al añadir la imagen");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      await adminProductsApi.deleteImage(productId, imageId);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch {
      setError("Error al eliminar la imagen");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-silver text-sm">Cargando imágenes...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-error text-sm">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current images */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-silver">Imágenes asignadas</p>
        {images.length === 0 ? (
          <p className="text-sm text-silver/60 italic">Sin imágenes</p>
        ) : (
          <ul className="space-y-2">
            {images.map((img) => (
              <li
                key={img.id}
                className="flex items-center gap-3 rounded-lg border border-graphite bg-carbon px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-mono truncate" title={img.imageUrl}>
                    {img.imageUrl}
                  </p>
                  {img.altText && (
                    <p className="text-xs text-silver truncate">{img.altText}</p>
                  )}
                  <p className="text-xs text-silver/50">Orden: {img.displayOrder}</p>
                </div>

                {confirmDeleteId === img.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-silver">¿Eliminar?</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === img.id}
                      onClick={() => handleDelete(img.id)}
                      className="h-7 px-2 text-xs"
                    >
                      Sí
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
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
                    onClick={() => setConfirmDeleteId(img.id)}
                    className="h-7 w-7 p-0 text-silver hover:text-error shrink-0"
                  >
                    ✕
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add image form */}
      <form onSubmit={handleAdd} className="space-y-3 border-t border-graphite pt-4">
        <p className="text-sm font-medium text-silver">Añadir imagen por URL</p>
        {addError && (
          <div className="p-2 bg-error/10 border border-error rounded text-error text-xs">{addError}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="img-url">URL de la imagen *</Label>
          <Input
            id="img-url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            required
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="img-alt">Texto alternativo (alt)</Label>
          <Input
            id="img-alt"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            placeholder="Descripción de la imagen"
          />
        </div>
        <Button
          type="submit"
          disabled={adding || !newUrl.trim()}
          className="bg-racing-red text-white hover:bg-racing-red/80"
        >
          {adding ? "Añadiendo..." : "Añadir imagen"}
        </Button>
      </form>
    </div>
  );
}
