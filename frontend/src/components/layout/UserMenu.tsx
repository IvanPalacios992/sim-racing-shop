"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { User, UserCircle, Package, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useIsAuthenticated, useUser, useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";

export function UserMenu() {
  const t = useTranslations("nav");
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const handleLogout = async () => {
    close();
    try {
      await authApi.logout();
    } finally {
      logout();
      router.push("/");
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="p-2 text-white transition-colors hover:text-electric-blue"
        aria-label={t("account")}
      >
        <User className="size-5" />
      </Link>
    );
  }

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={toggle}
        className="p-2 text-white transition-colors hover:text-electric-blue"
        aria-label={t("account")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <User className="size-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-3 min-w-[280px] overflow-hidden rounded-xl border border-graphite bg-carbon shadow-2xl"
          role="menu"
        >
          {/* Dropdown arrow */}
          <div className="absolute -top-1.5 right-[14px] size-3 rotate-45 border-l border-t border-graphite bg-carbon" />

          {/* Header */}
          <div className="border-b border-graphite px-6 py-4">
            <p className="text-base font-semibold text-white">{displayName}</p>
            <p className="text-sm text-silver">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/perfil"
              onClick={close}
              role="menuitem"
              className="flex items-center gap-4 px-6 py-3.5 text-white transition-colors hover:bg-graphite hover:text-electric-blue [&:hover_svg]:text-electric-blue"
            >
              <UserCircle className="size-5 text-silver transition-colors" />
              <span className="text-sm">{t("userMenu.profile")}</span>
            </Link>

            <Link
              href="/pedidos"
              onClick={close}
              role="menuitem"
              className="flex items-center gap-4 px-6 py-3.5 text-white transition-colors hover:bg-graphite hover:text-electric-blue [&:hover_svg]:text-electric-blue"
            >
              <Package className="size-5 text-silver transition-colors" />
              <span className="text-sm">{t("userMenu.orders")}</span>
            </Link>

            <Link
              href="/configuracion"
              onClick={close}
              role="menuitem"
              className="flex items-center gap-4 px-6 py-3.5 text-white transition-colors hover:bg-graphite hover:text-electric-blue [&:hover_svg]:text-electric-blue"
            >
              <Settings className="size-5 text-silver transition-colors" />
              <span className="text-sm">{t("userMenu.settings")}</span>
            </Link>

            {user?.roles.includes("Admin") && (
              <>
                <div className="my-2 h-px bg-graphite" />
                <Link
                  href="/admin/categorias"
                  onClick={close}
                  role="menuitem"
                  className="flex items-center gap-4 px-6 py-3.5 text-white transition-colors hover:bg-graphite hover:text-electric-blue [&:hover_svg]:text-electric-blue"
                >
                  <LayoutDashboard className="size-5 text-silver transition-colors" />
                  <span className="text-sm">Administración</span>
                </Link>
              </>
            )}

            <div className="my-2 h-px bg-graphite" />

            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-4 px-6 py-3.5 text-error transition-colors hover:bg-error/10"
            >
              <LogOut className="size-5 text-error" />
              <span className="text-sm">{t("userMenu.logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
