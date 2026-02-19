import { getTranslations } from "next-intl/server";
import CartContent from "./CartContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cart" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function CartPage() {
  return <CartContent />;
}
