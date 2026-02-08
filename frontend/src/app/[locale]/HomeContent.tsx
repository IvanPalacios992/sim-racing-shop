"use client";

import {
  HeroSection,
  FeaturedCategories,
  FeaturedProducts,
  ConfiguratorPromo,
  TrustIndicators,
} from "@/components/home";

export function HomeContent() {
  return (
    <main>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <ConfiguratorPromo />
      <TrustIndicators />
    </main>
  );
}
