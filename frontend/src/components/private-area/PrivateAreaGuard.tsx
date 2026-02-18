"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function PrivateAreaGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't check authentication until store is hydrated from localStorage
    if (!_hasHydrated) {
      return;
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isAuthenticated) {
      // Add a small delay to allow token refresh to complete
      // This prevents premature redirects during token refresh
      timeoutRef.current = setTimeout(() => {
        router.push("/login");
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, _hasHydrated, router]);

  // Show loading while hydrating or not authenticated
  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian-black flex items-center justify-center">
        <div className="text-silver">Verificando autenticación...</div>
      </div>
    );
  }

  return <>{children}</>;
}
