import { getTranslations } from "next-intl/server";
import OrdersContent from "@/components/private-area/orders/OrdersContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Orders" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function PedidosPage() {
  return <OrdersContent />;
}
