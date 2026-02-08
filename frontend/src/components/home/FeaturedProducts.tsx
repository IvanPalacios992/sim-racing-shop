"use client";

import { useTranslations } from "next-intl";
import { Heart, Star } from "lucide-react";

type MockProduct = {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: "new" | "sale";
};

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    brand: "Fanatec",
    name: "ClubSport Steering Wheel Formula V2.5",
    price: 349.95,
    rating: 5,
    reviews: 248,
    badge: "new",
  },
  {
    id: "2",
    brand: "Thrustmaster",
    name: "T300 RS GT Racing Wheel",
    price: 319.99,
    originalPrice: 399.99,
    rating: 4,
    reviews: 412,
    badge: "sale",
  },
  {
    id: "3",
    brand: "Heusinkveld",
    name: "Sprint Pedal Set",
    price: 799.0,
    rating: 5,
    reviews: 156,
  },
  {
    id: "4",
    brand: "Sim-Lab",
    name: "GT1 Evo Cockpit",
    price: 599.0,
    rating: 5,
    reviews: 89,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating ? "fill-champagne text-champagne" : "text-smoke"
          }`}
        />
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  const t = useTranslations("home.products");

  return (
    <section className="bg-carbon px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold tracking-widest text-white md:text-4xl">
        {t("title")}
      </h2>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="group cursor-pointer overflow-hidden rounded-xl border border-transparent bg-carbon transition-all duration-300 hover:-translate-y-1 hover:border-graphite hover:shadow-md"
          >
            {/* Image placeholder */}
            <div className="relative aspect-[4/3] bg-graphite">
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                      product.badge === "new" ? "bg-electric-blue" : "bg-racing-red"
                    }`}
                  >
                    {t(product.badge)}
                  </span>
                </div>
              )}

              {/* Wishlist */}
              <button
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-obsidian/80 text-white transition-all hover:scale-110 hover:bg-racing-red"
                aria-label={t("addToWishlist")}
              >
                <Heart className="size-[18px]" />
              </button>
            </div>

            {/* Info */}
            <div className="p-6">
              <p className="mb-1 text-sm text-silver">{product.brand}</p>
              <h3 className="mb-3 text-lg font-semibold leading-snug text-white">
                {product.name}
              </h3>
              <div className="mb-4 flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-silver">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">
                  &euro;{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-silver line-through">
                    &euro;{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
