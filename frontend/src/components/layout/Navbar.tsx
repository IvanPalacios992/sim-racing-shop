"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { useCartItemCount } from "@/stores/cart-store";
import { MiniCart } from "@/components/cart/MiniCart";

type NavLink = {
  key: "products" | "wheels" | "pedals" | "cockpits" | "accessories";
  href: string;
  localized?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { key: "products", href: "/productos", localized: true },
  { key: "wheels", href: "#" },
  { key: "pedals", href: "#" },
  { key: "cockpits", href: "#" },
  { key: "accessories", href: "#" },
];

export function Navbar() {
  const t = useTranslations("nav");
  const itemCount = useCartItemCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const toggleMiniCart = useCallback(() => setMiniCartOpen((prev) => !prev), []);
  const closeMiniCart = useCallback(() => setMiniCartOpen(false), []);

  return (
    <header className="sticky top-0 z-50 h-18 border-b border-graphite bg-obsidian/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest text-white">
          SIM<span className="text-racing-red">RACING</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ key, href, localized }) =>
            localized ? (
              <Link
                key={key}
                href={href}
                className="text-sm font-medium text-white transition-colors hover:text-electric-blue"
              >
                {t(key).toUpperCase()}
              </Link>
            ) : (
              <a
                key={key}
                href={href}
                className="text-sm font-medium text-white transition-colors hover:text-electric-blue"
              >
                {t(key).toUpperCase()}
              </a>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/productos"
            className="p-2 text-white transition-colors hover:text-electric-blue"
            aria-label={t("search")}
          >
            <Search className="size-5" />
          </Link>

          <Link
            href="/login"
            className="p-2 text-white transition-colors hover:text-electric-blue"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Link>

          {/* Cart button + MiniCart dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleMiniCart}
              className="relative p-2 text-white transition-colors hover:text-electric-blue"
              aria-label={t("cart")}
              aria-expanded={miniCartOpen}
              aria-haspopup="dialog"
            >
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full bg-racing-red text-[11px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            <MiniCart isOpen={miniCartOpen} onClose={closeMiniCart} />
          </div>

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
            {NAV_LINKS.map(({ key, href, localized }) =>
              localized ? (
                <Link
                  key={key}
                  href={href}
                  className="border-b border-graphite py-3 text-sm font-medium text-white transition-colors hover:text-electric-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(key).toUpperCase()}
                </Link>
              ) : (
                <a
                  key={key}
                  href={href}
                  className="border-b border-graphite py-3 text-sm font-medium text-white transition-colors hover:text-electric-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(key).toUpperCase()}
                </a>
              )
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
