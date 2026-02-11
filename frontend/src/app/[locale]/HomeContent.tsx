"use client";

import {
  HeroSection,
  FeaturedCategories,
  FeaturedProducts,
  ConfiguratorPromo,
  TrustIndicators,
  NewsletterSection,
} from "@/components/home";

export function HomeContent() {
  return (
    <main>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <ConfiguratorPromo />
      <TrustIndicators />
      <NewsletterSection />
    </main>
  );
}
