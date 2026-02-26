import { getTranslations } from "next-intl/server";
import CheckoutContent from "./CheckoutContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Checkout" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
