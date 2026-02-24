"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!isAuthenticated) {
      timeoutRef.current = setTimeout(() => router.push("/login"), 300);
    } else if (!user?.roles.includes("Admin")) {
      timeoutRef.current = setTimeout(() => router.push("/"), 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated, user, _hasHydrated, router]);

  if (!_hasHydrated || !isAuthenticated || !user?.roles.includes("Admin")) {
    return (
      <div className="min-h-screen bg-obsidian-black flex items-center justify-center">
        <div className="text-silver">Verificando acceso...</div>
      </div>
    );
  }

  return <>{children}</>;
}
