import { getTranslations } from "next-intl/server";
import OrderDetailContent from "@/components/private-area/orders/OrderDetailContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "OrderDetail" });

  return {
    title: t("pageTitle", { id }),
    description: t("pageDescription"),
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent orderId={id} />;
}
