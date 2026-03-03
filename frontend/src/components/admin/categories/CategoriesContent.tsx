"use client";

import { Search, X } from "lucide-react";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminRowActions from "@/components/admin/AdminRowActions";
import { useAdminList } from "@/components/admin/useAdminList";
import CategoryModal from "./CategoryModal";
import type { CategoryListItem } from "@/types/categories";

const PAGE_SIZE = 10;

export default function CategoriesContent() {
  const {
    items, page, totalPages, fetchStatus,
    modalOpen, editItem, confirmDeleteId, deleting,
    search, debouncedSearch,
    setPage, setSearch, setConfirmDeleteId, handleDelete, handleSuccess,
    openCreate, openEdit, closeModal, retry,
  } = useAdminList<CategoryListItem>(
    (p, s) => adminCategoriesApi.list("es", p, PAGE_SIZE, s),
    (id) => adminCategoriesApi.delete(id),
  );

  const toolbar = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver pointer-events-none" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full max-w-sm bg-obsidian border border-graphite rounded-lg pl-9 pr-9 py-2 text-sm text-pure-white placeholder:text-silver/50 focus:outline-none focus:border-racing-red"
      />
      {search && (
        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-pure-white">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <AdminContentShell
        title="Categorías"
        description="Gestiona las categorías del catálogo"
        createLabel="Nueva categoría"
        onCreateClick={openCreate}
        fetchStatus={fetchStatus}
        errorText="Error al cargar categorías"
        emptyText={debouncedSearch ? `No se encontraron resultados para "${debouncedSearch}"` : "No hay categorías creadas"}
        isEmpty={items.length === 0}
        onRetry={retry}
        toolbar={toolbar}
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
                  <AdminRowActions
                    isConfirming={confirmDeleteId === item.id}
                    deleting={deleting}
                    onEdit={() => openEdit(item)}
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
      <CategoryModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        editItem={editItem}
      />
    </>
  );
}
