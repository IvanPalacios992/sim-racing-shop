import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { AuthCard, RegisterForm } from "@/components/auth";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RegisterPageContent />;
}

function RegisterPageContent() {
  const t = useTranslations("auth.register");

  return (
    <AuthCard
      title={t("title")}
      subtitle={
        <>
          {t("subtitle")}{" "}
          <Link href="/login" className="text-electric-blue hover:underline">
            {t("signIn")}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
