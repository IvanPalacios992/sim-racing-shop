import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderSummaryDto } from "@/types/orders";

interface OrderCardProps {
  order: OrderSummaryDto;
}

const MAX_VISIBLE_ITEMS = 3;

export default function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations("Orders");

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.createdAt));

  const formattedTotal = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(order.totalAmount);

  const visibleItems = order.items.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = order.items.length - MAX_VISIBLE_ITEMS;

  return (
    <Card className="bg-obsidian border-graphite hover:border-electric-blue transition-colors duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 border-b">
          <div>
            <p className="text-pure-white font-semibold">{t("order")} #{order.orderNumber}</p>
            <p className="text-sm text-silver mt-1 mb-4">{t("orderedOn")} {formattedDate}</p>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <div>
                <p className="text-pure-white font-semibold">{item.productName}</p>
                <p className="text-sm text-silver mt-1 mb-4">{t("amount")}: {item.quantity}</p>
              </div>
              <div>
                €{item.lineTotal}
              </div>
            </li>
          ))}
          {remainingCount > 0 && (
            <li className="text-sm text-zinc-500">
              {t("andMore", { count: remainingCount })}
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full border-t pt-4">
          <span className="text-pure-white font-semibold">
            {t("total")}: {formattedTotal}
          </span>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/pedidos/${order.id}`}>{t("viewDetails")}</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
