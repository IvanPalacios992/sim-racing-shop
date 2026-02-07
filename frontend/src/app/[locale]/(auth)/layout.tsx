import { AuthLayout, AuthRedirectGuard } from "@/components/auth";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirectGuard>
      <AuthLayout>{children}</AuthLayout>
    </AuthRedirectGuard>
  );
}
