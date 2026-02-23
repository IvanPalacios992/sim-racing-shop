"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { categoriesApi } from "@/lib/api/categories";
import type { CategoryListItem } from "@/types/categories";

const GRADIENTS = [
  "from-racing-red/20 to-transparent",
  "from-electric-blue/20 to-transparent",
  "from-champagne/20 to-transparent",
  "from-silver/20 to-transparent",
  "from-smoke/20 to-transparent",
];

export function FeaturedCategories() {
  const t = useTranslations("home.categories");
  const locale = useLocale();
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const result = await categoriesApi.getCategories({
          locale,
          page: 1,
          pageSize: 5,
          isActive: true,
        });
        setCategories(result.items);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [locale]);

  if (loading) {
    return (
      <section className="bg-obsidian px-6 py-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
            {t("title")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:auto-rows-[280px]">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-xl bg-carbon ${
                  i < 2 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-obsidian px-6 py-24">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:auto-rows-[280px]">
          {categories.map((category, index) => {
            const large = index < 2;
            const gradient = GRADIENTS[index % GRADIENTS.length];

            return (
              <a
                key={category.id}
                href={`/${locale}/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-xl border border-transparent bg-carbon transition-all duration-300 hover:border-graphite hover:shadow-md ${
                  large ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                {/* Image or gradient background */}
                {category.imageUrl ? (
                  <div className="absolute inset-0">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 to-transparent p-6 md:p-8">
                  <h3
                    className={`mb-2 font-semibold text-white ${
                      large ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {category.name}
                  </h3>
                  {category.shortDescription && (
                    <p className="mb-3 line-clamp-2 text-sm text-silver">
                      {category.shortDescription}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-electric-blue">
                    {t("explore")} &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
