import { render, screen, waitFor } from "../../helpers/render";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { categoriesApi } from "@/lib/api/categories";
import type { CategoryListItem, PaginatedResult } from "@/types/categories";

vi.mock("@/lib/api/categories");

function createMockCategory(overrides?: Partial<CategoryListItem>): CategoryListItem {
  return {
    id: "cat-1",
    slug: "wheels",
    name: "Steering Wheels",
    shortDescription: "Premium racing wheels",
    imageUrl: "https://example.com/wheels.jpg",
    isActive: true,
    ...overrides,
  };
}

describe("FeaturedCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows loading skeletons while fetching", () => {
      vi.mocked(categoriesApi.getCategories).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<FeaturedCategories />);

      expect(screen.getByText("FEATURED CATEGORIES")).toBeInTheDocument();
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(5);
    });
  });

  describe("successful data fetching", () => {
    it("renders categories after loading", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [
          createMockCategory({ id: "cat-1", name: "Wheels", slug: "wheels" }),
          createMockCategory({ id: "cat-2", name: "Pedals", slug: "pedals" }),
        ],
        page: 1,
        pageSize: 5,
        totalCount: 2,
        totalPages: 1,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        expect(screen.getByText("Wheels")).toBeInTheDocument();
      });

      expect(screen.getByText("Pedals")).toBeInTheDocument();
    });

    it("calls API with correct parameters", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [],
        page: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        expect(categoriesApi.getCategories).toHaveBeenCalledWith({
          locale: "en",
          page: 1,
          pageSize: 5,
          isActive: true,
        });
      });
    });

    it("renders category images when available", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [
          createMockCategory({
            name: "Wheels",
            imageUrl: "https://example.com/wheels.jpg",
          }),
        ],
        page: 1,
        pageSize: 5,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        const image = screen.getByAltText("Wheels") as HTMLImageElement;
        expect(image.src).toBe("https://example.com/wheels.jpg");
      });
    });

    it("renders gradient when no image", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [
          createMockCategory({
            name: "Wheels",
            imageUrl: null,
          }),
        ],
        page: 1,
        pageSize: 5,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        expect(screen.getByText("Wheels")).toBeInTheDocument();
      });

      // Check that no img tag exists
      expect(screen.queryByAltText("Wheels")).not.toBeInTheDocument();
    });

    it("renders short description when available", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [
          createMockCategory({
            name: "Wheels",
            shortDescription: "Premium racing wheels",
          }),
        ],
        page: 1,
        pageSize: 5,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        expect(screen.getByText("Premium racing wheels")).toBeInTheDocument();
      });
    });

    it("links to category pages", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [createMockCategory({ name: "Wheels", slug: "wheels" })],
        page: 1,
        pageSize: 5,
        totalCount: 1,
        totalPages: 1,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      render(<FeaturedCategories />);

      await waitFor(() => {
        const link = screen.getByText("Wheels").closest("a");
        expect(link).toHaveAttribute("href", "/en/categories/wheels");
      });
    });
  });

  describe("empty state", () => {
    it("returns null when no categories", async () => {
      const mockCategories: PaginatedResult<CategoryListItem> = {
        items: [],
        page: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0,
      };

      vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories);

      const { container } = render(<FeaturedCategories />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("logs error and renders nothing on API failure", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(categoriesApi.getCategories).mockRejectedValue(
        new Error("API Error")
      );

      const { container } = render(<FeaturedCategories />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error loading categories:",
          expect.any(Error)
        );
      });

      // Should render nothing after error
      expect(container.firstChild).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
