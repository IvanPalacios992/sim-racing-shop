"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  MapPin,
  Package,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ordersApi } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderDetailDto, OrderStatus } from "@/types/orders";

interface OrderDetailContentProps {
  orderId: string;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

type TimelineStepState = "completed" | "current" | "pending";

interface TimelineStep {
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    titleKey: "timelineConfirmed",
    descKey: "timelineConfirmedDesc",
    icon: <Check className="w-4 h-4" />,
  },
  {
    titleKey: "timelineProcessing",
    descKey: "timelineProcessingDesc",
    icon: <Package className="w-4 h-4" />,
  },
  {
    titleKey: "timelineShipped",
    descKey: "timelineShippedDesc",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    titleKey: "timelineDelivered",
    descKey: "timelineDeliveredDesc",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
];

function getTimelineStates(status: OrderStatus): TimelineStepState[] {
  switch (status) {
    case "pending":
      return ["current", "pending", "pending", "pending"];
    case "processing":
      return ["completed", "current", "pending", "pending"];
    case "shipped":
      return ["completed", "completed", "current", "pending"];
    case "delivered":
      return ["completed", "completed", "completed", "completed"];
    case "cancelled":
      return ["pending", "pending", "pending", "pending"];
    default:
      return ["current", "pending", "pending", "pending"];
  }
}

function TimelineStepItem({
  step,
  state,
  date,
}: {
  step: TimelineStep;
  state: TimelineStepState;
  date?: string;
}) {
  const t = useTranslations("OrderDetail");

  const iconBg =
    state === "completed"
      ? "bg-green-500"
      : state === "current"
        ? "bg-racing-red animate-pulse"
        : "bg-graphite";

  const lineBg =
    state === "completed"
      ? "bg-green-500"
      : "bg-graphite";

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-pure-white ${iconBg}`}
        >
          {state === "completed" ? <Check className="w-4 h-4" /> : step.icon}
        </div>
        <div className={`w-0.5 flex-1 mt-1 last:hidden ${lineBg}`} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 pt-1">
        <p className="font-semibold text-pure-white">{t(step.titleKey)}</p>
        <p className="text-sm text-silver">{t(step.descKey)}</p>
        {date && (
          <p className="text-xs text-silver flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {date}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Summary row ─────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  highlight,
  isTotal,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center ${
        isTotal ? "pt-4 mt-4 border-t border-graphite font-bold text-pure-white" : ""
      }`}
    >
      <span className={isTotal ? "text-pure-white" : "text-silver text-sm"}>{label}</span>
      <span
        className={
          isTotal
            ? "text-racing-red text-lg"
            : highlight
              ? "text-green-400 text-sm font-medium"
              : "text-pure-white text-sm"
        }
      >
        {value}
      </span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-graphite rounded" />
      <div className="bg-carbon rounded-xl p-6 space-y-4">
        <div className="h-8 w-64 bg-graphite rounded" />
        <div className="flex gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-1">
              <div className="h-3 w-20 bg-graphite rounded" />
              <div className="h-4 w-28 bg-graphite rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-carbon rounded-xl p-6 space-y-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-graphite shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 bg-graphite rounded" />
              <div className="h-3 w-64 bg-graphite rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const t = useTranslations("OrderDetail");
  const tOrders = useTranslations("Orders");
  const { _hasHydrated } = useAuthStore();

  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [fetchStatus, setFetchStatus] = useState<"loading" | "success" | "error" | "not-found">(
    "loading"
  );
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;

    const load = async () => {
      setFetchStatus("loading");
      try {
        const data = await ordersApi.getOrderById(orderId);
        if (isMountedRef.current) {
          setOrder(data);
          setFetchStatus("success");
        }
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        setFetchStatus(status === 404 ? "not-found" : "error");
      }
    };

    load();
  }, [_hasHydrated, orderId, retryCount]);

  const handleCopy = () => {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);

  // ── Loading ──
  if (fetchStatus === "loading") return <LoadingSkeleton />;

  // ── Not found ──
  if (fetchStatus === "not-found") {
    return (
      <div className="bg-obsidian border border-graphite rounded-lg p-12 text-center">
        <p className="text-pure-white font-semibold text-lg mb-2">{t("notFound")}</p>
        <Button variant="secondary" asChild className="mt-4">
          <Link href="/pedidos">{t("backToOrders")}</Link>
        </Button>
      </div>
    );
  }

  // ── Error ──
  if (fetchStatus === "error" || !order) {
    return (
      <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
        <p className="text-error mb-4">{t("errorLoading")}</p>
        <Button variant="secondary" onClick={() => setRetryCount((c) => c + 1)}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  const timelineStates = getTimelineStates(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-silver">
        <Link href="/pedidos" className="hover:text-pure-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {t("backToOrders")}
        </Link>
        <span>/</span>
        <span className="text-pure-white">{order.orderNumber}</span>
      </nav>

      {/* Header */}
      <div className="bg-carbon rounded-xl grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="space-y-4 pb-6 border-b">
          <h1 className="text-2xl font-bold text-pure-white">
            {tOrders("order")} #{order.orderNumber}
          </h1>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-silver uppercase tracking-wide mb-1">{t("orderDate")}</p>
              <p className="font-semibold text-pure-white">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-silver uppercase tracking-wide mb-1">{t("status")}</p>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <div>
              <p className="text-xs text-silver uppercase tracking-wide mb-1">{t("total")}</p>
              <p className="font-bold text-racing-red text-xl">{formatCurrency(order.totalAmount)}</p>
            </div>
            {order.estimatedProductionDays && order.orderStatus === "processing" && (
              <div>
                <p className="text-xs text-silver uppercase tracking-wide mb-1">{t("estimatedDays")}</p>
                <p className="font-semibold text-pure-white">
                  {order.estimatedProductionDays} {t("days")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex flex-row lg:flex-col gap-3">
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-obsidian rounded-lg p-6">
        <h2 className="text-lg font-semibold text-pure-white mb-6">{t("shippingStatus")}</h2>

        {order.orderStatus === "cancelled" ? (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <span className="text-pure-white text-sm font-bold">✕</span>
            </div>
            <div>
              <p className="font-semibold text-pure-white">{tOrders("statusCancelled")}</p>
              <p className="text-sm text-silver">{t("cancelledDesc")}</p>
            </div>
          </div>
        ) : (
          <div className="pl-2">
            {TIMELINE_STEPS.map((step, i) => (
              <TimelineStepItem
                key={step.titleKey}
                step={step}
                state={timelineStates[i]}
                date={
                  i === 0
                    ? formatDate(order.createdAt)
                    : i === 2 && order.shippedAt
                      ? formatDate(order.shippedAt)
                      : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Tracking number */}
        {order.trackingNumber && (
          <div className="mt-6 p-4 bg-obsidian rounded-lg">
            <p className="font-semibold text-pure-white mb-3">{t("trackingNumber")}</p>
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono font-bold text-electric-blue text-base">
                {order.trackingNumber}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-silver border border-graphite px-3 py-1.5 rounded-lg hover:border-electric-blue hover:text-electric-blue transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? t("copied") : t("copyTracking")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main grid: items + sidebar */}
      <div className=" grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Items */}
        <div className=" bg-obsidian rounded-lg p-6 mb-6 p-6">
          <h2 className="text-lg font-semibold text-pure-white mb-4">
            {t("products")} ({order.orderItems.length}{" "}
            {order.orderItems.length === 1 ? t("item") : t("items")})
          </h2>

          <div className="space-y-3">
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
                  className="border-2 border-graphite rounded-lg p-4 hover:border-electric-blue transition-colors grid grid-cols-[1fr_auto] gap-4 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-silver font-mono">{item.productSku}</p>
                    <p className="font-semibold text-pure-white">{item.productName}</p>
                    {config && Object.keys(config).length > 0 && (
                      <p className="text-sm text-silver">
                        {Object.entries(config)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-lg text-pure-white">
                      {formatCurrency(item.lineTotal)}
                    </p>
                    <p className="text-sm text-silver">
                      {t("quantity")}: {item.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-obsidian rounded-lg">
              <p className="text-xs text-silver uppercase tracking-wide mb-1">{t("notes")}</p>
              <p className="text-sm text-pure-white">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Shipping address */}
          <Card className="bg-obsidian">
            <CardContent className="">
              <h2 className="text-lg font-semibold text-pure-white flex items-center gap-2 mb-5">
                {t("shippingAddress")}
              </h2>
              <address className="not-italic text-sm text-silver leading-relaxed">
                <span className="block text-pure-white font-medium mb-1">{order.shippingStreet}</span>
                {order.shippingPostalCode} {order.shippingCity}
                {order.shippingState ? `, ${order.shippingState}` : ""}
                <br />
                {order.shippingCountry}
              </address>
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card className="bg-obsidian">
            <CardContent>
              <h2 className="text-lg font-semibold text-pure-white mb-4">{t("orderSummary")}</h2>
              <div className="space-y-3">
                <SummaryRow
                  label={`${t("subtotal")} (${order.orderItems.length} ${order.orderItems.length === 1 ? t("item") : t("items")})`}
                  value={formatCurrency(order.subtotal)}
                />
                <SummaryRow
                  label={t("shipping")}
                  value={order.shippingCost === 0 ? t("freeShipping") : formatCurrency(order.shippingCost)}
                  highlight={order.shippingCost === 0}
                />
                <SummaryRow
                  label={t("vat")}
                  value={formatCurrency(order.vatAmount)}
                />
                <SummaryRow
                  label={t("totalPaid")}
                  value={formatCurrency(order.totalAmount)}
                  isTotal
                />
              </div>
            </CardContent>
          </Card>

          {/* Production notes */}
          {order.productionNotes && (
            <Card className="bg-carbon border-graphite">
              <CardContent className="pt-5">
                <h3 className="font-semibold text-pure-white flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-silver" />
                  {t("productionNotes")}
                </h3>
                <p className="text-sm text-silver">{order.productionNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Help section */}
      <div className="bg-carbon rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-pure-white mb-2">{t("helpTitle")}</h3>
        <p className="text-silver text-sm mb-4">{t("helpSubtitle")}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" size="sm">
            {t("helpEmail")}
          </Button>
          <Button variant="secondary" size="sm">
            {t("helpReturn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
