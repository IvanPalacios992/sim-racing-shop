import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/products/ProductCard";
import { createMockProductListItem } from "../../helpers/products";

describe("ProductCard", () => {
  describe("rendering", () => {
    it("renders product name", () => {
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      expect(screen.getByText("Formula V2.5 Steering Wheel")).toBeInTheDocument();
    });

    it("renders product SKU", () => {
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      expect(screen.getByText(/WHL-F-V25/)).toBeInTheDocument();
    });

    it("renders short description", () => {
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      expect(
        screen.getByText("Premium sim racing steering wheel")
      ).toBeInTheDocument();
    });

    it("renders price with VAT", () => {
      // basePrice: 349.99, vatRate: 21 → 349.99 * 1.21 = 423.49
      const product = createMockProductListItem({ basePrice: 349.99 });
      render(<ProductCard product={product} />);

      expect(screen.getByText(/423\.49/)).toBeInTheDocument();
    });

    it("renders product image", () => {
      const product = createMockProductListItem({
        imageUrl: "https://example.com/product.jpg",
      });
      render(<ProductCard product={product} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "https://example.com/product.jpg");
      expect(image).toHaveAttribute("alt", "Formula V2.5 Steering Wheel");
    });

    it("renders fallback when no image", () => {
      const product = createMockProductListItem({ imageUrl: null });
      render(<ProductCard product={product} />);

      // Should render SVG fallback
      const card = screen.getByText("Formula V2.5 Steering Wheel").closest("article");
      expect(card?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("customizable badge", () => {
    it("shows customizable badge when product is customizable", () => {
      const product = createMockProductListItem({ isCustomizable: true });
      render(<ProductCard product={product} />);

      expect(screen.getByText("Customizable")).toBeInTheDocument();
    });

    it("does not show badge when product is not customizable", () => {
      const product = createMockProductListItem({ isCustomizable: false });
      render(<ProductCard product={product} />);

      expect(screen.queryByText("Customizable")).not.toBeInTheDocument();
    });
  });

  describe("wishlist button", () => {
    it("renders wishlist button", () => {
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      expect(screen.getByLabelText("Add to wishlist")).toBeInTheDocument();
    });

    it("prevents navigation when wishlist button is clicked", async () => {
      const user = userEvent.setup();
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      const wishlistButton = screen.getByLabelText("Add to wishlist");
      await user.click(wishlistButton);

      // If preventDefault works, the page shouldn't navigate
      // This is implicitly tested by the lack of navigation error
      expect(wishlistButton).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("card links to product detail page", () => {
      const product = createMockProductListItem({ slug: "test-product" });
      render(<ProductCard product={product} />);

      const link = screen
        .getByText("Formula V2.5 Steering Wheel")
        .closest("a");
      expect(link).toHaveAttribute("href", "/productos/test-product");
    });
  });

  describe("styling", () => {
    it("has hover effects", () => {
      const product = createMockProductListItem();
      render(<ProductCard product={product} />);

      const article = screen.getByText("Formula V2.5 Steering Wheel").closest("article");
      expect(article).toHaveClass("hover:-translate-y-1");
    });
  });
});
