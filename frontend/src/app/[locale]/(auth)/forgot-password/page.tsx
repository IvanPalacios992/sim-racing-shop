import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AuthCard, ForgotPasswordForm } from "@/components/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordPageContent />;
}

function ForgotPasswordPageContent() {
  const t = useTranslations("auth.forgotPassword");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
