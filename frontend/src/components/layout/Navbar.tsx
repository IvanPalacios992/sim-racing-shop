"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { key: "wheels" as const, href: "#" },
  { key: "pedals" as const, href: "#" },
  { key: "cockpits" as const, href: "#" },
  { key: "accessories" as const, href: "#" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-18 border-b border-graphite bg-obsidian/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest text-white">
          SIM<span className="text-racing-red">RACING</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="text-sm font-medium text-white transition-colors hover:text-electric-blue"
            >
              {t(key).toUpperCase()}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-white transition-colors hover:text-electric-blue"
            aria-label={t("search")}
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/login"
            className="p-2 text-white transition-colors hover:text-electric-blue"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Link>

          <button
            className="relative p-2 text-white transition-colors hover:text-electric-blue"
            aria-label={t("cart")}
          >
            <ShoppingCart className="size-5" />
            <span className="absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-racing-red text-[11px] font-bold text-white">
              0
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            className="p-2 text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("menu")}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-graphite bg-obsidian md:hidden">
          <div className="flex flex-col px-6 py-4">
            {NAV_LINKS.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="border-b border-graphite py-3 text-sm font-medium text-white transition-colors hover:text-electric-blue"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(key).toUpperCase()}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
