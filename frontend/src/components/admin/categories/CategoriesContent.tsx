"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import { Button } from "@/components/ui/button";
import CategoryModal from "./CategoryModal";
import type { CategoryListItem } from "@/types/categories";

type FetchStatus = "loading" | "success" | "error";

export default function CategoriesContent() {
  const { _hasHydrated } = useAuthStore();
  const [items, setItems] = useState<CategoryListItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryListItem | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    const load = async () => {
      setFetchStatus("loading");
      try {
        const data = await adminCategoriesApi.list("es");
        if (isMountedRef.current) {
          setItems(data);
          setFetchStatus("success");
        }
      } catch {
        if (isMountedRef.current) setFetchStatus("error");
      }
    };
    load();
  }, [_hasHydrated, retryCount]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await adminCategoriesApi.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // silent — user sees no change in list
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSuccess = async () => {
    const data = await adminCategoriesApi.list("es");
    if (isMountedRef.current) setItems(data);
  };

  const openCreate = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: CategoryListItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-graphite py-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pure-white mb-1">Categorías</h1>
          <p className="text-silver">Gestiona las categorías del catálogo</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Loading skeleton */}
      {fetchStatus === "loading" && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-obsidian border border-graphite rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {fetchStatus === "error" && (
        <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
          <p className="text-error mb-4">Error al cargar categorías</p>
          <Button variant="secondary" onClick={() => setRetryCount((c) => c + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Table */}
      {fetchStatus === "success" && (
        <>
          {items.length === 0 ? (
            <div className="bg-obsidian border border-graphite rounded-lg p-12 text-center">
              <p className="text-silver">No hay categorías creadas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite text-silver text-left">
                    <th className="py-3 pr-4 font-medium">Nombre</th>
                    <th className="py-3 pr-4 font-medium">Slug</th>
                    <th className="py-3 pr-4 font-medium">Estado</th>
                    <th className="py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-graphite/50 hover:bg-obsidian/30 transition-colors"
                    >
                      <td className="py-3 pr-4 text-pure-white font-medium">{item.name}</td>
                      <td className="py-3 pr-4 text-silver font-mono text-xs">{item.slug}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-graphite text-silver"
                          }`}
                        >
                          {item.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3">
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-silver text-xs">¿Eliminar?</span>
                            <Button
                              size="xs"
                              variant="destructive"
                              disabled={deleting}
                              onClick={() => handleDelete(item.id)}
                            >
                              Sí
                            </Button>
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-silver hover:text-electric-blue transition-colors rounded"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 text-silver hover:text-racing-red transition-colors rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editItem={editItem}
      />
    </div>
  );
}
