import { render, screen, waitFor } from "../../helpers/render";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { productsApi } from "@/lib/api/products";
import { createMockProductListItem } from "../../helpers/products";
import type { PaginatedResult, ProductListItem } from "@/types/products";

vi.mock("@/lib/api/products");
vi.mock("@/components/products/ProductCard", () => ({
  ProductCard: ({ product }: { product: ProductListItem }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

describe("FeaturedProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows loading skeletons while fetching", () => {
      vi.mocked(productsApi.getProducts).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<FeaturedProducts />);

      expect(screen.getByText("BEST SELLERS")).toBeInTheDocument();
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(4);
    });
  });

  describe("successful data fetching", () => {
    it("renders products after loading", async () => {
      const mockProducts: PaginatedResult<ProductListItem> = {
        items: [
          createMockProductListItem({ id: "prod-1", name: "Wheel 1" }),
          createMockProductListItem({ id: "prod-2", name: "Wheel 2" }),
        ],
        page: 1,
        pageSize: 4,
        totalCount: 2,
        totalPages: 1,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts);

      render(<FeaturedProducts />);

      await waitFor(() => {
        expect(screen.getByText("Wheel 1")).toBeInTheDocument();
      });

      expect(screen.getByText("Wheel 2")).toBeInTheDocument();
    });

    it("calls API with correct parameters", async () => {
      const mockProducts: PaginatedResult<ProductListItem> = {
        items: [],
        page: 1,
        pageSize: 4,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts);

      render(<FeaturedProducts />);

      await waitFor(() => {
        expect(productsApi.getProducts).toHaveBeenCalledWith({
          locale: "en",
          page: 1,
          pageSize: 4,
          isCustomizable: true,
        });
      });
    });

    it("renders ProductCard for each product", async () => {
      const mockProducts: PaginatedResult<ProductListItem> = {
        items: [
          createMockProductListItem({ id: "prod-1" }),
          createMockProductListItem({ id: "prod-2" }),
          createMockProductListItem({ id: "prod-3" }),
        ],
        page: 1,
        pageSize: 4,
        totalCount: 3,
        totalPages: 1,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts);

      render(<FeaturedProducts />);

      await waitFor(() => {
        const productCards = screen.getAllByTestId("product-card");
        expect(productCards).toHaveLength(3);
      });
    });
  });

  describe("empty state", () => {
    it("returns null when no products", async () => {
      const mockProducts: PaginatedResult<ProductListItem> = {
        items: [],
        page: 1,
        pageSize: 4,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts);

      const { container } = render(<FeaturedProducts />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("logs error and renders nothing on API failure", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(productsApi.getProducts).mockRejectedValue(
        new Error("API Error")
      );

      const { container } = render(<FeaturedProducts />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error loading products:",
          expect.any(Error)
        );
      });

      // Should render nothing after error
      expect(container.firstChild).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
