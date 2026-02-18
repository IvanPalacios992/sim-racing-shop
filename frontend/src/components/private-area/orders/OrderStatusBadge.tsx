import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/types/orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-zinc-500/20 text-zinc-400",
  processing: "bg-blue-500/20 text-blue-400",
  shipped: "bg-amber-500/20 text-amber-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusKeys: Record<OrderStatus, string> = {
  pending: "statusPending",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslations("Orders");
  const style = statusStyles[status] ?? "bg-zinc-500/20 text-zinc-400";
  const labelKey = statusKeys[status] ?? "statusPending";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${style}`}
    >
      {t(labelKey)}
    </span>
  );
}
