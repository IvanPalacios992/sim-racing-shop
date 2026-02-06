import { z } from "zod";

// Password validation helpers
export const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
};

export const checkPasswordRequirements = (password: string) => ({
  minLength: password.length >= passwordRequirements.minLength,
  hasUppercase: passwordRequirements.hasUppercase.test(password),
  hasLowercase: passwordRequirements.hasLowercase.test(password),
  hasNumber: passwordRequirements.hasNumber.test(password),
});

export const isPasswordValid = (password: string) => {
  const checks = checkPasswordRequirements(password);
  return Object.values(checks).every(Boolean);
};

// Schema factory that uses translation function
export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
    rememberMe: z.boolean().optional(),
  });

export const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z
        .string()
        .min(1, t("auth.validation.emailRequired"))
        .email(t("auth.validation.emailInvalid")),
      password: z
        .string()
        .min(1, t("auth.validation.passwordRequired"))
        .min(8, t("auth.validation.passwordMinLength"))
        .regex(/[A-Z]/, t("auth.validation.passwordUppercase"))
        .regex(/[a-z]/, t("auth.validation.passwordLowercase"))
        .regex(/[0-9]/, t("auth.validation.passwordNumber")),
      confirmPassword: z.string().min(1, t("auth.validation.confirmPasswordRequired")),
      acceptTerms: z
        .boolean()
        .refine((val) => val === true, {
          message: t("auth.validation.termsRequired"),
        }),
      newsletter: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });

export const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
  });

export const createResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: z
        .string()
        .min(1, t("auth.validation.passwordRequired"))
        .min(8, t("auth.validation.passwordMinLength"))
        .regex(/[A-Z]/, t("auth.validation.passwordUppercase"))
        .regex(/[a-z]/, t("auth.validation.passwordLowercase"))
        .regex(/[0-9]/, t("auth.validation.passwordNumber")),
      confirmPassword: z.string().min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });

// Type exports
export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordFormData = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
