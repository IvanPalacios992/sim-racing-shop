"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { adminProductsApi } from "@/lib/api/admin-products";
import { adminComponentsApi } from "@/lib/api/admin-components";
import { Button } from "@/components/ui/button";
import AdminContentShell from "@/components/admin/AdminContentShell";
import ProductModal from "./ProductModal";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";
import type { FetchStatus } from "@/components/admin/adminUtils";

export default function ProductsContent() {
  const { _hasHydrated } = useAuthStore();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [components, setComponents] = useState<AdminComponentListItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductListItem | undefined>(undefined);
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
      const [productsData, componentsData] = await Promise.all([
        adminProductsApi.list("es"),
        adminComponentsApi.list("es"),
      ]);
      if (isMountedRef.current) {
        setProducts(productsData);
        setComponents(componentsData);
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
      await adminProductsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
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

  const openEdit = (item: ProductListItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

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
        onRetry={() => setRetryCount((c) => c + 1)}
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
                  {confirmDeleteId === product.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-silver text-xs">¿Eliminar?</span>
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={deleting}
                        onClick={() => handleDelete(product.id)}
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
                        onClick={() => openEdit(product)}
                        className="p-1.5 text-silver hover:text-electric-blue transition-colors rounded"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(product.id)}
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
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        editItem={editItem}
        availableComponents={components}
      />
    </>
  );
}
