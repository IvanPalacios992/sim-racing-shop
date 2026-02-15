"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./PasswordInput";
import { Link, useRouter } from "@/i18n/navigation";
import { createLoginSchema, type LoginFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const loginSchema = createLoginSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      setAuth(response);
      router.push("/");
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 401) {
          setError(t("auth.login.errors.invalidCredentials"));
        } else if (status === 423) {
          setError(t("auth.login.errors.accountLocked"));
        } else if (status === 403) {
          setError(t("auth.login.errors.unverifiedEmail"));
        } else {
          setError(t("auth.login.errors.generic"));
        }
      } else {
        setError(t("auth.login.errors.generic"));
      }
    }
  };

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
            {t("auth.login.email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.login.emailPlaceholder")}
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

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            {t("auth.login.password")}
          </Label>
          <PasswordInput
            id="password"
            placeholder={t("auth.login.passwordPlaceholder")}
            autoComplete="current-password"
            disabled={isSubmitting}
            showLabel={t("auth.password.show")}
            hideLabel={t("auth.password.hide")}
            className={cn(
              "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
              errors.password && "border-error focus:border-error"
            )}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-error text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
              disabled={isSubmitting}
              className="border-graphite data-[state=checked]:bg-racing-red data-[state=checked]:border-racing-red"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-silver cursor-pointer"
            >
              {t("auth.login.rememberMe")}
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-electric-blue hover:underline"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t("auth.login.submit")
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-graphite" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-carbon px-2 text-silver">{t("common.or")}</span>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center text-silver text-sm">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="text-electric-blue hover:underline">
          {t("auth.login.createAccount")}
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
