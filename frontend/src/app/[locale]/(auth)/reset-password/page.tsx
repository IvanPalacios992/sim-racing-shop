import { Suspense } from "react";
import { ResetPasswordContent } from "./ResetPasswordContent";
import { AuthCard } from "@/components/auth";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Reset Password">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-silver" />
          </div>
        </AuthCard>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
