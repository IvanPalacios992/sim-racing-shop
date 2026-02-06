"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./PasswordInput";
import { PasswordRequirements } from "./PasswordRequirements";
import { Link } from "@/i18n/navigation";
import {
  createResetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

interface ResetPasswordFormProps {
  email: string;
  token: string;
}

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const resetPasswordSchema = createResetPasswordSchema(t);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    try {
      await authApi.resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 400 || status === 404) {
          setInvalidToken(true);
        } else {
          setError(t("auth.resetPassword.errors.generic"));
        }
      } else {
        setError(t("auth.resetPassword.errors.generic"));
      }
    }
  };

  // Invalid/Expired Token State
  if (invalidToken) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-error" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            {t("auth.resetPassword.errors.invalidToken")}
          </h2>
        </div>

        <Link href="/forgot-password">
          <Button className="w-full bg-racing-red hover:bg-racing-red/90 text-white font-semibold h-12 text-base">
            {t("auth.resetPassword.errors.requestNew")}
          </Button>
        </Link>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">
            {t("auth.resetPassword.success.title")}
          </h2>
          <p className="text-silver text-sm">
            {t("auth.resetPassword.success.message")}
          </p>
        </div>

        <Link href="/login">
          <Button className="w-full bg-racing-red hover:bg-racing-red/90 text-white font-semibold h-12 text-base">
            {t("auth.resetPassword.success.signIn")}
          </Button>
        </Link>
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
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-white">
            {t("auth.resetPassword.newPassword")}
          </Label>
          <PasswordInput
            id="newPassword"
            placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
            autoComplete="new-password"
            disabled={isSubmitting}
            showLabel={t("auth.password.show")}
            hideLabel={t("auth.password.hide")}
            className={cn(
              "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
              errors.newPassword && "border-error focus:border-error"
            )}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-error text-sm">{errors.newPassword.message}</p>
          )}
          {password && (
            <PasswordRequirements
              password={password}
              labels={{
                title: t("auth.password.requirements.title"),
                minLength: t("auth.password.requirements.minLength"),
                uppercase: t("auth.password.requirements.uppercase"),
                lowercase: t("auth.password.requirements.lowercase"),
                number: t("auth.password.requirements.number"),
              }}
            />
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            {t("auth.resetPassword.confirmPassword")}
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            disabled={isSubmitting}
            showLabel={t("auth.password.show")}
            hideLabel={t("auth.password.hide")}
            className={cn(
              "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
              errors.confirmPassword && "border-error focus:border-error"
            )}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-error text-sm">{errors.confirmPassword.message}</p>
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
          t("auth.resetPassword.submit")
        )}
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
