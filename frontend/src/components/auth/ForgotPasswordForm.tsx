"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const forgotPasswordSchema = createForgotPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setEmailSent(true);
      startCooldown();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(t("auth.forgotPassword.errors.generic"));
      } else {
        setError(t("auth.forgotPassword.errors.generic"));
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await authApi.forgotPassword({ email: sentEmail });
      startCooldown();
    } catch {
      setError(t("auth.forgotPassword.errors.generic"));
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-success" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            {t("auth.forgotPassword.success.title")}
          </h2>
          <p className="text-silver text-sm">
            {t("auth.forgotPassword.success.message", { email: sentEmail })}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            variant="outline"
            className="w-full border-graphite text-white hover:bg-graphite"
          >
            {resendCooldown > 0
              ? t("auth.forgotPassword.success.resendIn", {
                  seconds: resendCooldown,
                })
              : t("auth.forgotPassword.success.resend")}
          </Button>

          <button
            onClick={() => {
              setEmailSent(false);
              setSentEmail("");
            }}
            className="text-sm text-electric-blue hover:underline"
          >
            {t("auth.forgotPassword.success.tryDifferent")}
          </button>
        </div>

        <p className="text-xs text-smoke">{t("auth.forgotPassword.success.help")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            {t("auth.forgotPassword.email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            autoComplete="email"
            disabled={isSubmitting}
            className={cn(
              "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
              errors.email && "border-error focus:border-error"
            )}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-error text-sm">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-racing-red hover:bg-racing-red/90 text-white font-semibold h-12 text-base"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t("auth.forgotPassword.submit")
        )}
      </Button>

      {/* Back to Login */}
      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-silver hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("auth.forgotPassword.backToLogin")}
      </Link>
    </form>
  );
}

export default ForgotPasswordForm;
