"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import { Button } from "@/components/ui/button";
import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminPagination from "@/components/admin/AdminPagination";
import CategoryModal from "./CategoryModal";
import type { CategoryListItem } from "@/types/categories";
import type { FetchStatus } from "@/components/admin/adminUtils";

const PAGE_SIZE = 10;

export default function CategoriesContent() {
  const { _hasHydrated } = useAuthStore();
  const [items, setItems] = useState<CategoryListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
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

  const loadPage = async (p: number) => {
    setFetchStatus("loading");
    try {
      const data = await adminCategoriesApi.list("es", p, PAGE_SIZE);
      if (isMountedRef.current) {
        setItems(data.items);
        setTotalPages(data.totalPages);
        setFetchStatus("success");
      }
    } catch {
      if (isMountedRef.current) setFetchStatus("error");
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    loadPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, page, retryCount]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await adminCategoriesApi.delete(id);
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) {
        setPage(newPage);
      } else {
        setRetryCount((c) => c + 1);
      }
    } catch {
      // silent — user sees no change in list
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSuccess = () => {
    setPage(1);
    setRetryCount((c) => c + 1);
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
    <>
    <AdminContentShell
      title="Categorías"
      description="Gestiona las categorías del catálogo"
      createLabel="Nueva categoría"
      onCreateClick={openCreate}
      fetchStatus={fetchStatus}
      errorText="Error al cargar categorías"
      emptyText="No hay categorías creadas"
      isEmpty={items.length === 0}
      onRetry={() => setRetryCount((c) => c + 1)}
    >
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
    </AdminContentShell>
    {fetchStatus === "success" && (
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    )}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editItem={editItem}
      />
    </>
  );
}
