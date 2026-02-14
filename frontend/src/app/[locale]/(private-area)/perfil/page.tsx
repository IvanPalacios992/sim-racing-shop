import { getTranslations } from "next-intl/server";
import ProfileContent from "@/components/private-area/ProfileContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Profile" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function ProfilePage() {
  return <ProfileContent />;
}
