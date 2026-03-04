"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { adminComponentsApi } from "@/lib/api/admin-components";
import { adminCategoriesApi } from "@/lib/api/admin-categories";
import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminRowActions from "@/components/admin/AdminRowActions";
import { useAdminList } from "@/components/admin/useAdminList";
import ProductModal from "./ProductModal";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";
import type { CategoryListItem } from "@/types/categories";

const PAGE_SIZE = 10;

export default function ProductsContent() {
  const [components, setComponents] = useState<AdminComponentListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  const {
    items: products, page, totalPages, fetchStatus,
    modalOpen, editItem, confirmDeleteId, deleting,
    search, debouncedSearch,
    setPage, setSearch, setConfirmDeleteId, handleDelete, handleSuccess,
    openCreate, openEdit, closeModal, retry,
  } = useAdminList<ProductListItem>(
    async (p, s) => {
      const [productsResult, componentsResult, categoriesResult] = await Promise.all([
        adminProductsApi.list("es", p, PAGE_SIZE, s),
        adminComponentsApi.list("es", 1, 200),
        adminCategoriesApi.list("es", 1, 200),
      ]);
      setComponents(componentsResult.items);
      setCategories(categoriesResult.items);
      return { items: productsResult.items, totalPages: productsResult.totalPages };
    },
    (id) => adminProductsApi.delete(id),
  );

  const toolbar = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver pointer-events-none" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o SKU..."
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
        title="Productos"
        description="Gestiona los productos del catálogo"
        createLabel="Nuevo producto"
        onCreateClick={openCreate}
        fetchStatus={fetchStatus}
        errorText="Error al cargar productos"
        emptyText={debouncedSearch ? `No se encontraron resultados para "${debouncedSearch}"` : "No hay productos creados"}
        isEmpty={products.length === 0}
        onRetry={retry}
        toolbar={toolbar}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite text-silver text-left">
              <th className="py-3 pr-4 font-medium">SKU</th>
              <th className="py-3 pr-4 font-medium">Nombre</th>
              <th className="py-3 pr-4 font-medium">Precio base</th>
              <th className="py-3 pr-4 font-medium">Estado</th>
              <th className="py-3 pr-4 font-medium">Personalizable</th>
              <th className="py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-graphite/50 hover:bg-obsidian/30 transition-colors"
              >
                <td className="py-3 pr-4 text-silver font-mono text-xs">{product.sku}</td>
                <td className="py-3 pr-4 text-pure-white font-medium">{product.name}</td>
                <td className="py-3 pr-4 text-silver">{product.basePrice.toFixed(2)} €</td>
                <td className="py-3 pr-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-graphite text-silver"
                    }`}
                  >
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isCustomizable
                        ? "bg-electric-blue/20 text-electric-blue"
                        : "bg-graphite text-silver"
                    }`}
                  >
                    {product.isCustomizable ? "Sí" : "No"}
                  </span>
                </td>
                <td className="py-3">
                  <AdminRowActions
                    isConfirming={confirmDeleteId === product.id}
                    deleting={deleting}
                    onEdit={() => openEdit(product)}
                    onRequestDelete={() => setConfirmDeleteId(product.id)}
                    onConfirmDelete={() => handleDelete(product.id)}
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
      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        editItem={editItem}
        availableComponents={components}
        availableCategories={categories}
      />
    </>
  );
}
