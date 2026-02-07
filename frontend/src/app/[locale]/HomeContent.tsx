"use client";

import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { useTranslations } from "next-intl";

export function HomeContent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const t = useTranslations("home");

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // API failure is non-critical — we still clear local auth state
    } finally {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-white tracking-wider">
          SIMRACING<span className="text-racing-red">SHOP</span>
        </h1>
        <p className="text-silver text-lg">
          {t("tagline")}
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <span className="px-6 py-3 text-white font-semibold">
                {t("welcome", { name: user?.firstName ?? user?.email ?? "" })}
              </span>
              <button
                onClick={handleLogout}
                className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-3 bg-racing-red text-white font-semibold rounded-lg hover:bg-racing-red/90 transition-colors"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                {t("createAccount")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
