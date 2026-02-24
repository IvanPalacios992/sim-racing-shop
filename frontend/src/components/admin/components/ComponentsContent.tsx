"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { adminComponentsApi } from "@/lib/api/admin-components";
import { Button } from "@/components/ui/button";
import AdminContentShell from "@/components/admin/AdminContentShell";
import ComponentModal from "./ComponentModal";
import type { AdminComponentListItem } from "@/types/admin";
import type { FetchStatus } from "@/components/admin/adminUtils";

interface ComponentsWithLocales {
  es: AdminComponentListItem;
  en: AdminComponentListItem | undefined;
}

export default function ComponentsContent() {
  const { _hasHydrated } = useAuthStore();
  const [items, setItems] = useState<ComponentsWithLocales[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ComponentsWithLocales | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = async () => {
    setFetchStatus("loading");
    try {
      const [esData, enData] = await Promise.all([
        adminComponentsApi.list("es"),
        adminComponentsApi.list("en"),
      ]);
      const enMap = new Map(enData.map((c) => [c.id, c]));
      const merged: ComponentsWithLocales[] = esData.map((c) => ({
        es: c,
        en: enMap.get(c.id),
      }));
      if (isMountedRef.current) {
        setItems(merged);
        setFetchStatus("success");
      }
    } catch {
      if (isMountedRef.current) setFetchStatus("error");
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, retryCount]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await adminComponentsApi.delete(id);
      setItems((prev) => prev.filter((i) => i.es.id !== id));
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSuccess = () => loadData();

  const openCreate = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: ComponentsWithLocales) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <>
      <AdminContentShell
        title="Componentes"
        description="Gestiona los componentes del catálogo"
        createLabel="Nuevo componente"
        onCreateClick={openCreate}
        fetchStatus={fetchStatus}
        errorText="Error al cargar componentes"
        emptyText="No hay componentes creados"
        isEmpty={items.length === 0}
        onRetry={() => setRetryCount((c) => c + 1)}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite text-silver text-left">
              <th className="py-3 pr-4 font-medium">SKU</th>
              <th className="py-3 pr-4 font-medium">Nombre</th>
              <th className="py-3 pr-4 font-medium">Tipo</th>
              <th className="py-3 pr-4 font-medium">Stock</th>
              <th className="py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ es: item }) => (
              <tr
                key={item.id}
                className="border-b border-graphite/50 hover:bg-obsidian/30 transition-colors"
              >
                <td className="py-3 pr-4 text-silver font-mono text-xs">{item.sku}</td>
                <td className="py-3 pr-4 text-pure-white font-medium">{item.name}</td>
                <td className="py-3 pr-4 text-silver">{item.componentType}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.inStock
                        ? "bg-green-500/20 text-green-400"
                        : "bg-racing-red/20 text-racing-red"
                    }`}
                  >
                    {item.stockQuantity} — {item.inStock ? "En stock" : "Agotado"}
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
                        onClick={() => openEdit({ es: item, en: items.find((i) => i.es.id === item.id)?.en })}
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
      <ComponentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editItem={editItem}
      />
    </>
  );
}
