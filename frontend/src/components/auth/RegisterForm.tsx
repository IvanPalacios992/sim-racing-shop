"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "./PasswordInput";
import { PasswordRequirements } from "./PasswordRequirements";
import { Link, useRouter } from "@/i18n/navigation";
import { createRegisterSchema, type RegisterFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const registerSchema = createRegisterSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      newsletter: false,
    },
  });

  const password = watch("password");
  const acceptTerms = watch("acceptTerms");
  const newsletter = watch("newsletter");

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        language: locale,
      });
      setAuth(response);
      router.push("/");
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 409) {
          setError(t("auth.register.errors.emailExists"));
        } else {
          setError(t("auth.register.errors.generic"));
        }
      } else {
        setError(t("auth.register.errors.generic"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Fields - Two columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white">
              {t("auth.register.firstName")}
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder={t("auth.register.firstNamePlaceholder")}
              autoComplete="given-name"
              disabled={isSubmitting}
              className={cn(
                "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
                errors.firstName && "border-error focus:border-error"
              )}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-error text-sm">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white">
              {t("auth.register.lastName")}
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder={t("auth.register.lastNamePlaceholder")}
              autoComplete="family-name"
              disabled={isSubmitting}
              className={cn(
                "bg-carbon border-graphite text-white placeholder:text-silver focus:border-electric-blue",
                errors.lastName && "border-error focus:border-error"
              )}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-error text-sm">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            {t("auth.register.email")}*
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.register.emailPlaceholder")}
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
            {t("auth.register.password")}*
          </Label>
          <PasswordInput
            id="password"
            placeholder={t("auth.register.passwordPlaceholder")}
            autoComplete="new-password"
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
            {t("auth.register.confirmPassword")}*
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
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

        {/* Terms Checkbox */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms ?? false}
              onCheckedChange={(checked) => setValue("acceptTerms", checked === true)}
              disabled={isSubmitting}
              className="mt-0.5 border-graphite data-[state=checked]:bg-racing-red data-[state=checked]:border-racing-red"
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm text-silver cursor-pointer leading-relaxed"
            >
              {t("auth.register.terms")}{" "}
              <Link
                href="/terms"
                className="text-electric-blue hover:underline"
                target="_blank"
              >
                {t("auth.register.termsLink")}
              </Link>{" "}
              {t("auth.register.and")}{" "}
              <Link
                href="/privacy"
                className="text-electric-blue hover:underline"
                target="_blank"
              >
                {t("auth.register.privacyLink")}
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-error text-sm">{errors.acceptTerms.message}</p>
          )}

          {/* Newsletter Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={newsletter ?? false}
              onCheckedChange={(checked) => setValue("newsletter", checked === true)}
              disabled={isSubmitting}
              className="border-graphite data-[state=checked]:bg-racing-red data-[state=checked]:border-racing-red"
            />
            <Label
              htmlFor="newsletter"
              className="text-sm text-silver cursor-pointer"
            >
              {t("auth.register.newsletter")}
            </Label>
          </div>
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
          t("auth.register.submit")
        )}
      </Button>

      {/* Login Link */}
      <p className="text-center text-silver text-sm">
        {t("auth.register.subtitle")}{" "}
        <Link href="/login" className="text-electric-blue hover:underline">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
