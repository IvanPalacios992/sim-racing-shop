import { render, screen } from "../helpers/render";
import React from "react";
import { HomeContent } from "@/app/[locale]/HomeContent";

// Mock the home components to avoid API calls in tests
vi.mock("@/components/home", () => ({
  HeroSection: () => React.createElement("div", { "data-testid": "hero-section" }, "Hero Section"),
  FeaturedCategories: () => React.createElement("div", { "data-testid": "featured-categories" }, "Featured Categories"),
  FeaturedProducts: () => React.createElement("div", { "data-testid": "featured-products" }, "Featured Products"),
  ConfiguratorPromo: () => React.createElement("div", { "data-testid": "configurator-promo" }, "Configurator Promo"),
  TrustIndicators: () => React.createElement("div", { "data-testid": "trust-indicators" }, "Trust Indicators"),
  NewsletterSection: () => React.createElement("div", { "data-testid": "newsletter-section" }, "Newsletter Section"),
}));

describe("HomeContent", () => {
  it("renders all home sections", () => {
    render(React.createElement(HomeContent));

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("featured-categories")).toBeInTheDocument();
    expect(screen.getByTestId("featured-products")).toBeInTheDocument();
    expect(screen.getByTestId("configurator-promo")).toBeInTheDocument();
    expect(screen.getByTestId("trust-indicators")).toBeInTheDocument();
    expect(screen.getByTestId("newsletter-section")).toBeInTheDocument();
  });

  it("renders sections in correct order", () => {
    render(React.createElement(HomeContent));

    const main = screen.getByRole("main");
    const sections = Array.from(main.children);

    expect(sections[0]).toHaveAttribute("data-testid", "hero-section");
    expect(sections[1]).toHaveAttribute("data-testid", "featured-categories");
    expect(sections[2]).toHaveAttribute("data-testid", "featured-products");
    expect(sections[3]).toHaveAttribute("data-testid", "configurator-promo");
    expect(sections[4]).toHaveAttribute("data-testid", "trust-indicators");
    expect(sections[5]).toHaveAttribute("data-testid", "newsletter-section");
  });
});
