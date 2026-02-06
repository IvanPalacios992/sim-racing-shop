"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthCard, ResetPasswordForm } from "@/components/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("auth.resetPassword");

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  // If missing required params, show error state
  if (!email || !token) {
    return (
      <AuthCard title={t("errors.invalidToken")}>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error" />
            </div>
          </div>

          <Link href="/forgot-password">
            <Button className="w-full bg-racing-red hover:bg-racing-red/90 text-white font-semibold h-12 text-base">
              {t("errors.requestNew")}
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <ResetPasswordForm email={email} token={token} />
    </AuthCard>
  );
}
