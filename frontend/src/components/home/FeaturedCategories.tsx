"use client";

import { useTranslations } from "next-intl";

const CATEGORIES = [
  { key: "wheels" as const, large: true, gradient: "from-racing-red/20 to-transparent" },
  { key: "bases" as const, large: true, gradient: "from-electric-blue/20 to-transparent" },
  { key: "pedals" as const, large: false, gradient: "from-champagne/20 to-transparent" },
  { key: "cockpits" as const, large: false, gradient: "from-silver/20 to-transparent" },
  { key: "accessories" as const, large: false, gradient: "from-smoke/20 to-transparent" },
] as const;

export function FeaturedCategories() {
  const t = useTranslations("home.categories");

  return (
    <section className="bg-obsidian px-6 py-24">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:auto-rows-[280px]">
          {CATEGORIES.map(({ key, large, gradient }) => (
            <a
              key={key}
              href="#"
              className={`group relative overflow-hidden rounded-xl border border-transparent bg-carbon transition-all duration-300 hover:border-graphite hover:shadow-md ${
                large ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              {/* Placeholder image area with gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
              />

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 to-transparent p-6 md:p-8">
                <h3
                  className={`mb-2 font-semibold text-white ${
                    large ? "text-2xl" : "text-lg"
                  }`}
                >
                  {t(key)}
                </h3>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
                  {t("explore")} &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
