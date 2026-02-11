import { render, screen, waitFor } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import { ProductsPageContent } from "@/app/[locale]/productos/ProductsPageContent";
import { productsApi } from "@/lib/api/products";
import { createMockProductListItem } from "../helpers/products";
import type { PaginatedResult, ProductListItem } from "@/types/products";
import type { FilterValues } from "@/components/products/ProductFilters";

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/productos",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/productos",
}));

vi.mock("@/lib/api/products");

// Mock child components
vi.mock("@/components/products", () => ({
  ProductGrid: ({
    products,
    loading,
  }: {
    products: ProductListItem[];
    loading: boolean;
  }) => (
    <div data-testid="product-grid">
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : products.length === 0 ? (
        <div data-testid="empty">No products found</div>
      ) : (
        products.map((p) => <div key={p.id}>{p.name}</div>)
      )}
    </div>
  ),
  ProductFilters: ({
    filters,
    onFiltersChange,
  }: {
    filters: FilterValues;
    onFiltersChange: (f: FilterValues) => void;
  }) => (
    <div data-testid="product-filters">
      <input
        data-testid="search-input"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />
      <button onClick={() => onFiltersChange({ ...filters, minPrice: "100" })}>
        Change Filter
      </button>
    </div>
  ),
  Pagination: ({
    currentPage,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

describe("ProductsPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.toString = () => "";
    // Use real timers for simpler async handling
  });

  afterEach(() => {
    // Cleanup
  });

  describe("initial render", () => {
    it("shows loading state initially", () => {
      vi.mocked(productsApi.getProducts).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ProductsPageContent />);

      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });

    it("fetches and displays products", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [
          createMockProductListItem({ id: "1", name: "Product 1" }),
          createMockProductListItem({ id: "2", name: "Product 2" }),
        ],
        page: 1,
        pageSize: 12,
        totalCount: 2,
        totalPages: 1,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      // Wait for debounce (300ms) and async fetch
      await waitFor(
        () => {
          expect(screen.getByText("Product 1")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("displays page title", () => {
      vi.mocked(productsApi.getProducts).mockResolvedValue({
        items: [],
        page: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 0,
      });

      render(<ProductsPageContent />);

      expect(screen.getByText("Products")).toBeInTheDocument();
    });
  });

  describe("product count display", () => {
    it("shows product count when loaded", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [createMockProductListItem()],
        page: 1,
        pageSize: 12,
        totalCount: 25,
        totalPages: 3,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(
        () => {
          expect(screen.getByText(/Showing 1-12 of 25/)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("does not show count while loading", () => {
      vi.mocked(productsApi.getProducts).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ProductsPageContent />);

      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });
  });

  describe("filters", () => {
    it("updates filters and resets to page 1", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [createMockProductListItem()],
        page: 1,
        pageSize: 12,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByTestId("product-grid"), { timeout: 1000 });

      vi.mocked(productsApi.getProducts).mockClear();

      const changeFilterButton = screen.getByText("Change Filter");
      await userEvent.click(changeFilterButton);

      await waitFor(
        () => {
          expect(productsApi.getProducts).toHaveBeenCalledWith(
            expect.objectContaining({
              minPrice: 100,
            })
          );
        },
        { timeout: 1000 }
      );
    });

    it("debounces search input", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [],
        page: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByTestId("search-input"), { timeout: 1000 });

      vi.mocked(productsApi.getProducts).mockClear();

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "wheel");

      // After debounce (300ms), should call API
      await waitFor(
        () => {
          expect(productsApi.getProducts).toHaveBeenCalledWith(
            expect.objectContaining({
              search: "wheel",
            })
          );
        },
        { timeout: 1000 }
      );
    });

    it("updates URL when filters change", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [],
        page: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByTestId("product-filters"), { timeout: 1000 });

      const changeFilterButton = screen.getByText("Change Filter");
      await userEvent.click(changeFilterButton);

      await waitFor(
        () => {
          expect(mockReplace).toHaveBeenCalledWith(
            "/productos?minPrice=100",
            { scroll: false }
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("pagination", () => {
    it("changes page when pagination button clicked", async () => {
      const mockResult: PaginatedResult<ProductListItem> = {
        items: [createMockProductListItem()],
        page: 1,
        pageSize: 12,
        totalCount: 25,
        totalPages: 3,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByTestId("pagination"), { timeout: 1000 });

      const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

      vi.mocked(productsApi.getProducts).mockClear();

      const nextButton = screen.getByText("Next");
      await userEvent.click(nextButton);

      await waitFor(
        () => {
          expect(productsApi.getProducts).toHaveBeenCalledWith(
            expect.objectContaining({
              page: 2,
            })
          );
        },
        { timeout: 1000 }
      );

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

      scrollToSpy.mockRestore();
    });

    it("hides pagination while loading", () => {
      vi.mocked(productsApi.getProducts).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ProductsPageContent />);

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows error message on API failure", async () => {
      vi.mocked(productsApi.getProducts).mockRejectedValue(
        new Error("API Error")
      );

      render(<ProductsPageContent />);

      await waitFor(
        () => {
          expect(
            screen.getByText("Error loading products")
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("shows retry button on error", async () => {
      vi.mocked(productsApi.getProducts).mockRejectedValue(
        new Error("API Error")
      );

      render(<ProductsPageContent />);

      await waitFor(
        () => {
          expect(screen.getByText("Retry")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("retries fetching when retry button clicked", async () => {
      vi.mocked(productsApi.getProducts).mockRejectedValueOnce(
        new Error("API Error")
      );

      const mockResult: PaginatedResult<ProductListItem> = {
        items: [createMockProductListItem({ name: "Product 1" })],
        page: 1,
        pageSize: 12,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValueOnce(mockResult);

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByText("Retry"), { timeout: 1000 });

      const retryButton = screen.getByText("Retry");
      await userEvent.click(retryButton);

      await waitFor(
        () => {
          expect(screen.getByText("Product 1")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("hides pagination on error", async () => {
      vi.mocked(productsApi.getProducts).mockRejectedValue(
        new Error("API Error")
      );

      render(<ProductsPageContent />);

      await waitFor(() => screen.getByText("Retry"), { timeout: 1000 });

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  describe("URL query params", () => {
    it("parses initial filters from URL", async () => {
      mockSearchParams.get = vi.fn((key: string) => {
        const params: Record<string, string> = {
          search: "wheel",
          minPrice: "100",
          maxPrice: "500",
          customizable: "true",
          sortBy: "BasePrice",
          sortDesc: "true",
          page: "2",
        };
        return params[key] || null;
      });

      const mockResult: PaginatedResult<ProductListItem> = {
        items: [],
        page: 2,
        pageSize: 12,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockResult);

      render(<ProductsPageContent />);

      await waitFor(
        () => {
          expect(productsApi.getProducts).toHaveBeenCalledWith({
            search: "wheel",
            minPrice: 100,
            maxPrice: 500,
            isCustomizable: true,
            sortBy: "BasePrice",
            sortDescending: true,
            locale: "en",
            page: 2,
            pageSize: 12,
          });
        },
        { timeout: 1000 }
      );
    });
  });
});
