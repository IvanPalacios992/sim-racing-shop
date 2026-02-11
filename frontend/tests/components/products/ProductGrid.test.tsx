import { render, screen } from "../../helpers/render";
import { ProductGrid } from "@/components/products/ProductGrid";
import { createMockProductListItem } from "../../helpers/products";

// Mock ProductCard to simplify testing
vi.mock("@/components/products/ProductCard", () => ({
  ProductCard: ({ product }: { product: { name: string; id: string } }) => (
    <div data-testid={`product-${product.id}`}>{product.name}</div>
  ),
}));

describe("ProductGrid", () => {
  describe("with products", () => {
    it("renders all products", () => {
      const products = [
        createMockProductListItem({ id: "1", name: "Product 1" }),
        createMockProductListItem({ id: "2", name: "Product 2" }),
        createMockProductListItem({ id: "3", name: "Product 3" }),
      ];

      render(<ProductGrid products={products} loading={false} />);

      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    it("renders correct number of ProductCard components", () => {
      const products = [
        createMockProductListItem({ id: "1" }),
        createMockProductListItem({ id: "2" }),
        createMockProductListItem({ id: "3" }),
      ];

      render(<ProductGrid products={products} loading={false} />);

      expect(screen.getByTestId("product-1")).toBeInTheDocument();
      expect(screen.getByTestId("product-2")).toBeInTheDocument();
      expect(screen.getByTestId("product-3")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("renders skeleton loaders when loading", () => {
      const { container } = render(<ProductGrid products={[]} loading={true} />);

      // Should render 12 skeleton loaders (default page size)
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(12);
    });

    it("does not render products when loading", () => {
      const products = [createMockProductListItem({ id: "1", name: "Product 1" })];

      render(<ProductGrid products={products} loading={true} />);

      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows no results message when no products and not loading", () => {
      render(<ProductGrid products={[]} loading={false} />);

      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters or search term")
      ).toBeInTheDocument();
    });

    it("renders SearchX icon in empty state", () => {
      const { container } = render(<ProductGrid products={[]} loading={false} />);

      // Lucide icons render as SVGs
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("has responsive grid layout", () => {
      const products = [createMockProductListItem()];
      const { container } = render(<ProductGrid products={products} loading={false} />);

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid");
      expect(grid).toHaveClass("xl:grid-cols-3");
    });
  });
});
