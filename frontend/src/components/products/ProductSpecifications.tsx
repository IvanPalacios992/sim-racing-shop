"use client";

import { useTranslations } from "next-intl";
import type { ProductSpecification } from "@/types/products";

type Props = {
  specifications: ProductSpecification[];
};

export function ProductSpecifications({ specifications }: Props) {
  const t = useTranslations("productDetail");

  const sortedSpecs = [...specifications].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="mt-12 rounded-xl bg-carbon p-8">
      <h2 className="mb-6 text-xl font-semibold text-white">
        {t("specifications")}
      </h2>
      <div className="overflow-hidden rounded-lg">
        {sortedSpecs.map((spec, index) => (
          <div
            key={`${spec.specKey}-${spec.displayOrder}`}
            className={`flex items-center justify-between px-4 py-3 ${
              index % 2 === 0 ? "bg-graphite/50" : "bg-carbon"
            }`}
          >
            <span className="text-sm font-medium text-silver">
              {spec.specKey}
            </span>
            <span className="text-sm text-white">{spec.specValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
