"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductImage } from "@/types/products";

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: Props) {
  const t = useTranslations("productDetail");

  const sortedImages = [...images].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = sortedImages[selectedIndex] || null;

  if (sortedImages.length === 0) {
    return (
      <div className="rounded-xl bg-carbon p-8">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-graphite">
          <svg
            className="size-24 text-smoke/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-carbon p-8">
      {/* Gallery tab indicator */}
      <div className="mb-4">
        <span className="border-b-2 border-racing-red pb-2 text-sm font-medium text-white">
          {t("gallery")}
        </span>
      </div>

      {/* Main image */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-graphite">
        <img
          src={selectedImage!.imageUrl}
          alt={selectedImage!.altText || productName}
          className="size-full object-contain"
        />
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === selectedIndex
                  ? "border-racing-red"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={t("selectImage", { index: index + 1 })}
            >
              <img
                src={image.imageUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
