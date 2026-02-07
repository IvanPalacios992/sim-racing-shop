import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AuthCard, LoginForm } from "@/components/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageContent />;
}

function LoginPageContent() {
  const t = useTranslations("auth.login");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <LoginForm />
    </AuthCard>
  );
}
