"use client";

import { adminComponentsApi } from "@/lib/api/admin-components";
import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminRowActions from "@/components/admin/AdminRowActions";
import { useAdminList } from "@/components/admin/useAdminList";
import ComponentModal from "./ComponentModal";
import type { AdminComponentListItem } from "@/types/admin";

const PAGE_SIZE = 10;

interface ComponentsWithLocales {
  es: AdminComponentListItem;
  en: AdminComponentListItem | undefined;
}

export default function ComponentsContent() {
  const {
    items, page, totalPages, fetchStatus,
    modalOpen, editItem, confirmDeleteId, deleting,
    setPage, setConfirmDeleteId, handleDelete, handleSuccess,
    openCreate, openEdit, closeModal, retry,
  } = useAdminList<ComponentsWithLocales>(
    async (p) => {
      const [esResult, enResult] = await Promise.all([
        adminComponentsApi.list("es", p, PAGE_SIZE),
        adminComponentsApi.list("en", p, PAGE_SIZE),
      ]);
      const enMap = new Map(enResult.items.map((c) => [c.id, c]));
      const merged: ComponentsWithLocales[] = esResult.items.map((c) => ({
        es: c,
        en: enMap.get(c.id),
      }));
      return { items: merged, totalPages: esResult.totalPages };
    },
    (id) => adminComponentsApi.delete(id),
  );

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
        onRetry={retry}
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
                  <AdminRowActions
                    isConfirming={confirmDeleteId === item.id}
                    deleting={deleting}
                    onEdit={() => openEdit({ es: item, en: items.find((i) => i.es.id === item.id)?.en })}
                    onRequestDelete={() => setConfirmDeleteId(item.id)}
                    onConfirmDelete={() => handleDelete(item.id)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminContentShell>
      {fetchStatus === "success" && (
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
      <ComponentModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        editItem={editItem}
      />
    </>
  );
}
