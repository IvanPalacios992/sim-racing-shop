"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { User, ShoppingBag, Heart, Settings, LogOut } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/perfil", labelKey: "profile", icon: User },
  { href: "/pedidos", labelKey: "orders", icon: ShoppingBag },
  { href: "/favoritos", labelKey: "wishlist", icon: Heart },
  { href: "/configuracion", labelKey: "settings", icon: Settings },
];

export default function PrivateAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("PrivateArea");
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API call fails, clear local state and redirect
      logout();
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="p-6 bg-carbon rounded-lg overflow-hidden">
              {/* User Info */}
              <div className="py-6 mb-6 border-b border-graphite">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-graphite flex items-center justify-center">
                    <User className="w-10 h-10 text-silver" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-pure-white mb-1">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email}
                  </div>
                  <div className="text-sm text-silver">{user?.email}</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    // Check if current path ends with the item href (works with i18n routes like /es/perfil, /en/perfil)
                    const isActive = pathname.endsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-racing-red text-pure-white"
                              : "text-pure-white hover:bg-graphite"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{t(item.labelKey)}</span>
                        </Link>
                      </li>
                    );
                  })}

                  {/* Logout Button */}
                  <li className="pt-4 border-t border-graphite">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-racing-red cursor-pointer hover:bg-graphite"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">{t("logout")}</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="p-6 bg-carbon">{children}</main>
        </div>
      </div>
    </div>
  );
}
