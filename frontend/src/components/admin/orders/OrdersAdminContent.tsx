"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { adminOrdersApi } from "@/lib/api/admin-orders";
import AdminPagination from "@/components/admin/AdminPagination";
import OrderStatusBadge from "@/components/private-area/orders/OrderStatusBadge";
import OrderAdminDetailModal from "./OrderAdminDetailModal";
import type { AdminOrderSummaryDto } from "@/types/admin";
import type { FetchStatus } from "@/components/admin/adminUtils";
import type { OrderStatus } from "@/types/orders";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type FilterOption = "all" | OrderStatus;

const FILTER_CHIPS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "En proceso" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OrdersAdminContent() {
  const { _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<AdminOrderSummaryDto[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    setFetchStatus("loading");
    const status = activeFilter === "all" ? undefined : activeFilter;
    adminOrdersApi.list(page, PAGE_SIZE, status).then(
      (result) => {
        if (isMountedRef.current) {
          setOrders(result.items);
          setTotalPages(result.totalPages);
          setFetchStatus("success");
        }
      },
      () => {
        if (isMountedRef.current) setFetchStatus("error");
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, page, retryCount, activeFilter]);

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleOrderUpdated = (updatedOrder: AdminOrderSummaryDto) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatAmount = (amount: number) =>
    amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  return (
    <div>
      <div className="border-b border-graphite py-6 mb-6">
        <h1 className="text-3xl font-bold text-pure-white mb-1">Pedidos</h1>
        <p className="text-silver">Gestiona y actualiza el estado de los pedidos</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeFilter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => handleFilterChange(chip.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-racing-red text-pure-white border border-racing-red"
                  : "bg-obsidian text-silver border border-graphite hover:border-electric-blue hover:text-pure-white"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {fetchStatus === "loading" && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-obsidian border border-graphite rounded animate-pulse" />
          ))}
        </div>
      )}

      {fetchStatus === "error" && (
        <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
          <p className="text-error mb-4">Error al cargar los pedidos</p>
          <Button variant="secondary" onClick={() => setRetryCount((c) => c + 1)}>
            Reintentar
          </Button>
        </div>
      )}

      {fetchStatus === "success" && (
        <>
          {orders.length === 0 ? (
            <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
              <p className="text-silver">No hay pedidos con este estado</p>
              {activeFilter !== "all" && (
                <button
                  onClick={() => handleFilterChange("all")}
                  className="mt-3 text-electric-blue text-sm hover:underline"
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite text-silver text-left">
                    <th className="py-3 pr-4 font-medium">N° Pedido</th>
                    <th className="py-3 pr-4 font-medium">Usuario</th>
                    <th className="py-3 pr-4 font-medium">Fecha</th>
                    <th className="py-3 pr-4 font-medium">Estado</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Artículos</th>
                    <th className="py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-graphite/50 hover:bg-obsidian/30 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-pure-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 pr-4 text-silver text-xs">
                        {order.userEmail ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-silver">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="py-3 pr-4 text-pure-white font-medium">
                        {formatAmount(order.totalAmount)}
                      </td>
                      <td className="py-3 pr-4 text-silver text-center">
                        {order.itemCount}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <OrderAdminDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
