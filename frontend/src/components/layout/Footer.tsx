"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-graphite bg-obsidian px-8 py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="mb-4 block">
              <span className="text-2xl font-bold tracking-wider text-white">
                SIM<span className="text-racing-red">RACING</span>
              </span>
            </Link>
            <p className="mb-6 text-silver">{t("tagline")}</p>

            {/* Social links */}
            <div className="flex gap-4 text-2xl">
              <a
                href="#"
                className="text-silver transition-colors hover:text-electric-blue"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="#"
                className="text-silver transition-colors hover:text-electric-blue"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="text-silver transition-colors hover:text-electric-blue"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="#"
                className="text-silver transition-colors hover:text-electric-blue"
                aria-label="YouTube"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="mb-6 text-base font-semibold text-white">
              {t("shop.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/productos"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("shop.products")}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("shop.categories")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("shop.newArrivals")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("shop.sale")}
                </a>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h3 className="mb-6 text-base font-semibold text-white">
              {t("support.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("support.contact")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("support.faq")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("support.shipping")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("support.returns")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="mb-6 text-base font-semibold text-white">
              {t("company.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("company.about")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("company.blog")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("company.careers")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-silver transition-colors hover:text-electric-blue"
                >
                  {t("company.press")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-graphite pt-8 text-sm text-silver md:flex-row">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-8">
            <a
              href="#"
              className="transition-colors hover:text-electric-blue"
            >
              {t("privacy")}
            </a>
            <a
              href="#"
              className="transition-colors hover:text-electric-blue"
            >
              {t("terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
