"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, Package, ShoppingCart, LayoutDashboard, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/componentes", label: "Componentes", icon: Package },
  { href: "/admin/productos", label: "Productos", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-obsidian-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="p-6 bg-carbon rounded-lg overflow-hidden">
              <div className="py-6 mb-6 border-b border-graphite flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-racing-red" />
                <h2 className="text-lg font-bold text-pure-white">Administración</h2>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname.includes(item.href);
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
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="p-6 bg-carbon rounded-lg">{children}</main>
        </div>
      </div>
    </div>
  );
}
