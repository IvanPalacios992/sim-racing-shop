import { getTranslations } from "next-intl/server";
import SettingsContent from "@/components/private-area/SettingsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function SettingsPage() {
  return <SettingsContent />;
}
