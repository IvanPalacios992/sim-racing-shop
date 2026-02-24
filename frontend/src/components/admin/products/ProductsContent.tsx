"use client";

import { useState } from "react";
import { adminProductsApi } from "@/lib/api/admin-products";
import { adminComponentsApi } from "@/lib/api/admin-components";
import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminRowActions from "@/components/admin/AdminRowActions";
import { useAdminList } from "@/components/admin/useAdminList";
import ProductModal from "./ProductModal";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";

const PAGE_SIZE = 10;

export default function ProductsContent() {
  const [components, setComponents] = useState<AdminComponentListItem[]>([]);

  const {
    items: products, page, totalPages, fetchStatus,
    modalOpen, editItem, confirmDeleteId, deleting,
    setPage, setConfirmDeleteId, handleDelete, handleSuccess,
    openCreate, openEdit, closeModal, retry,
  } = useAdminList<ProductListItem>(
    async (p) => {
      const [productsResult, componentsResult] = await Promise.all([
        adminProductsApi.list("es", p, PAGE_SIZE),
        adminComponentsApi.list("es", 1, 200),
      ]);
      setComponents(componentsResult.items);
      return { items: productsResult.items, totalPages: productsResult.totalPages };
    },
    (id) => adminProductsApi.delete(id),
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
        emptyText="No hay productos creados"
        isEmpty={products.length === 0}
        onRetry={retry}
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
      />
    </>
  );
}
