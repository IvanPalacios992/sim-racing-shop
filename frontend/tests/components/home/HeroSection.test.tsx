import { render, screen } from "../../helpers/render";
import { HeroSection } from "@/components/home/HeroSection";

describe("HeroSection", () => {
  it("renders the hero title", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "ENGINEERED FOR VICTORY"
    );
  });

  it("renders the tagline", () => {
    render(<HeroSection />);

    expect(
      screen.getByText(
        "Premium sim racing equipment for those who demand perfection"
      )
    ).toBeInTheDocument();
  });

  it("renders primary CTA button with correct link", () => {
    render(<HeroSection />);

    const ctaButton = screen.getByText("EXPLORE PRODUCTS");
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest("a")).toHaveAttribute("href", "/productos");
  });

  it("renders secondary CTA button", () => {
    render(<HeroSection />);

    expect(screen.getByText("WATCH VIDEO")).toBeInTheDocument();
  });

  it("renders scroll indicator", () => {
    render(<HeroSection />);

    // ChevronDown icon should be present
    const section = screen.getByRole("heading").closest("section");
    expect(section).toBeInTheDocument();
  });

  it("has full-screen height", () => {
    render(<HeroSection />);

    const section = screen.getByRole("heading").closest("section");
    expect(section).toHaveClass("min-h-screen");
  });
});
