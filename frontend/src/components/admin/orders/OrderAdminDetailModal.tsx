"use client";

import { useEffect, useState } from "react";
import AdminModal from "@/components/admin/AdminModal";
import OrderStatusBadge from "@/components/private-area/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { adminOrdersApi } from "@/lib/api/admin-orders";
import type { AdminOrderDetailDto, AdminOrderSummaryDto } from "@/types/admin";
import type { OrderStatus } from "@/types/orders";

interface OrderAdminDetailModalProps {
  orderId: string | null;
  onClose: () => void;
  onOrderUpdated: (updated: AdminOrderSummaryDto) => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Marcar como En proceso",
  processing: "Marcar como Enviado",
  shipped: "Marcar como Entregado",
};

export default function OrderAdminDetailModal({
  orderId,
  onClose,
  onOrderUpdated,
}: OrderAdminDetailModalProps) {
  const [order, setOrder] = useState<AdminOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    adminOrdersApi
      .getById(orderId)
      .then(setOrder)
      .catch(() => setError("Error al cargar el pedido"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const nextStatus = NEXT_STATUS[order.orderStatus as OrderStatus];
    if (!nextStatus) return;

    setAdvancing(true);
    setError(null);
    try {
      const updated = await adminOrdersApi.updateStatus(order.id, { status: nextStatus });
      setOrder(updated);
      onOrderUpdated({
        id: updated.id,
        orderNumber: updated.orderNumber,
        userEmail: updated.userEmail ?? null,
        totalAmount: updated.totalAmount,
        orderStatus: updated.orderStatus as OrderStatus,
        createdAt: updated.createdAt,
        itemCount: updated.orderItems.length,
      });
    } catch {
      setError("Error al actualizar el estado");
    } finally {
      setAdvancing(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (amount: number) =>
    amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  const nextStatusLabel = order
    ? NEXT_STATUS_LABEL[order.orderStatus as OrderStatus]
    : undefined;

  return (
    <AdminModal
      isOpen={!!orderId}
      onClose={onClose}
      title={order ? `Pedido ${order.orderNumber}` : "Detalle de pedido"}
    >
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-8 bg-obsidian border border-graphite rounded animate-pulse" />
          ))}
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      {!loading && order && (
        <div className="space-y-6">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-silver mb-1">N° Pedido</p>
              <p className="text-pure-white font-mono">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-silver mb-1">Fecha</p>
              <p className="text-pure-white">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-silver mb-1">Usuario</p>
              <p className="text-pure-white">{order.userEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-silver mb-1">Estado</p>
              <OrderStatusBadge status={order.orderStatus as OrderStatus} />
            </div>
          </div>

          {/* Advance status button */}
          {nextStatusLabel && (
            <div className="flex items-center gap-3">
              <Button onClick={handleAdvanceStatus} disabled={advancing}>
                {advancing ? "Actualizando..." : nextStatusLabel}
              </Button>
            </div>
          )}

          {/* Two columns: items + shipping/totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: order items */}
            <div>
              <h3 className="text-pure-white font-semibold mb-3 text-sm">Artículos</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => {
                  const config = item.configurationJson
                    ? (() => {
                        try {
                          return JSON.parse(item.configurationJson) as Record<string, string>;
                        } catch {
                          return null;
                        }
                      })()
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="bg-obsidian border border-graphite rounded p-3 text-xs"
                    >
                      <p className="text-pure-white font-medium">{item.productName}</p>
                      <p className="text-silver font-mono">{item.productSku}</p>
                      {config && Object.keys(config).length > 0 && (
                        <p className="text-silver mt-1">
                          {Object.entries(config)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")}
                        </p>
                      )}
                      <div className="flex justify-between mt-1 text-silver">
                        <span>× {item.quantity}</span>
                        <span className="text-pure-white">{formatAmount(item.lineTotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: shipping + totals */}
            <div className="space-y-4">
              <div>
                <h3 className="text-pure-white font-semibold mb-3 text-sm">Dirección de envío</h3>
                <address className="not-italic text-silver text-xs leading-relaxed">
                  <p>{order.shippingStreet}</p>
                  <p>
                    {order.shippingPostalCode} {order.shippingCity}
                    {order.shippingState ? `, ${order.shippingState}` : ""}
                  </p>
                  <p>{order.shippingCountry}</p>
                </address>
              </div>

              <div>
                <h3 className="text-pure-white font-semibold mb-3 text-sm">Resumen</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-silver">
                    <span>Subtotal</span>
                    <span>{formatAmount(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>IVA</span>
                    <span>{formatAmount(order.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Envío</span>
                    <span>{formatAmount(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-pure-white font-semibold border-t border-graphite pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatAmount(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModal>
  );
}
