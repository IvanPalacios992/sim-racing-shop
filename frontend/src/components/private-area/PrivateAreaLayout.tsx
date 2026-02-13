"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";

interface NavItem {
  href: string;
  labelKey: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/perfil", labelKey: "profile", icon: "account_circle" },
  { href: "/pedidos", labelKey: "orders", icon: "shopping_bag" },
  { href: "/favoritos", labelKey: "wishlist", icon: "favorite" },
  { href: "/configuracion", labelKey: "settings", icon: "settings" },
];

export default function PrivateAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("PrivateArea");
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-obsidian-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-carbon-gray border border-graphite rounded-lg overflow-hidden">
              {/* User Info */}
              <div className="p-6 border-b border-graphite">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-graphite flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-silver">
                      person
                    </span>
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
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-racing-red text-pure-white"
                              : "text-silver hover:bg-graphite hover:text-pure-white"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {item.icon}
                          </span>
                          <span className="font-medium">{t(item.labelKey)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
