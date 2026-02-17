"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ordersApi } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import OrderCard from "./OrderCard";
import type { OrderSummaryDto, OrderStatus } from "@/types/orders";

type FilterOption = "all" | OrderStatus;

interface FilterChip {
  value: FilterOption;
  labelKey: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { value: "all", labelKey: "filterAll" },
  { value: "pending", labelKey: "filterPending" },
  { value: "processing", labelKey: "filterProcessing" },
  { value: "shipped", labelKey: "filterShipped" },
  { value: "delivered", labelKey: "filterDelivered" },
  { value: "cancelled", labelKey: "filterCancelled" },
];

type FetchStatus = "loading" | "success" | "error";

export default function OrdersContent() {
  const t = useTranslations("Orders");
  const { _hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [retryCount, setRetryCount] = useState(0);

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
        const data = await ordersApi.getOrders();
        if (isMountedRef.current) {
          setOrders(data);
          setFetchStatus("success");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        if (isMountedRef.current) setFetchStatus("error");
      }
    };

    load();
  }, [_hasHydrated, retryCount]);

  const handleRetry = () => setRetryCount((c) => c + 1);

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === activeFilter);

  return (
    <div>
      {/* Header */}
      <div className="border-b border-graphite py-6 mb-6">
        <h1 className="text-3xl font-bold text-pure-white mb-2">{t("title")}</h1>
        <p className="text-silver">{t("subtitle")}</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeFilter === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-racing-red text-pure-white border border-racing-red"
                  : "bg-obsidian text-silver border border-graphite hover:border-electric-blue hover:text-pure-white"
              }`}
            >
              {t(chip.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {fetchStatus === "loading" && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-obsidian border border-graphite rounded-xl p-6 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-graphite rounded" />
                  <div className="h-3 w-28 bg-graphite rounded" />
                </div>
                <div className="h-6 w-24 bg-graphite rounded-full" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-56 bg-graphite rounded" />
                <div className="h-3 w-44 bg-graphite rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-graphite rounded" />
                <div className="h-8 w-28 bg-graphite rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {fetchStatus === "error" && (
        <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
          <p className="text-error mb-4">{t("errorLoading")}</p>
          <Button variant="secondary" onClick={handleRetry}>
            {t("retry")}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {fetchStatus === "success" && orders.length === 0 && (
        <div className="bg-obsidian border border-graphite rounded-lg p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-graphite mx-auto mb-4" />
          <p className="text-pure-white font-semibold text-lg mb-2">
            {t("empty")}
          </p>
          <p className="text-silver mb-6">{t("emptySubtitle")}</p>
          <Button variant="secondary" asChild>
            <Link href="/productos">{t("shopNow")}</Link>
          </Button>
        </div>
      )}

      {/* Orders list */}
      {fetchStatus === "success" && orders.length > 0 && (
        <>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
              <p className="text-silver">{t("noOrdersForFilter")}</p>
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-3 text-electric-blue text-sm hover:underline"
              >
                {t("filterAll")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
