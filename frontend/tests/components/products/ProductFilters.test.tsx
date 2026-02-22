import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { FilterValues } from "@/components/products/ProductFilters";
import type { CategoryListItem } from "@/types/categories";

const mockCategories: CategoryListItem[] = [
  { id: "cat-1", name: "Volantes", slug: "volantes", shortDescription: null, imageUrl: null, isActive: true },
  { id: "cat-2", name: "Pedales", slug: "pedales", shortDescription: null, imageUrl: null, isActive: true },
];

describe("ProductFilters", () => {
  const mockOnFiltersChange = vi.fn();
  const defaultFilters: FilterValues = {
    search: "",
    categorySlug: "",
    minPrice: "",
    maxPrice: "",
    isCustomizable: false,
    sortBy: "",
    sortDescending: false,
  };

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  describe("search input", () => {
    it("renders search input", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
    });

    it("displays current search value", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, search: "steering wheel" }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByDisplayValue("steering wheel")).toBeInTheDocument();
    });

    it("calls onFiltersChange immediately when typing", async () => {
      const user = userEvent.setup();

      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search products...");
      await user.type(searchInput, "p");

      // Should call immediately for each keystroke (no debounce in component)
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: "p",
      });
    });
  });

  describe("price range inputs", () => {
    it("renders min price input", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
    });

    it("renders max price input", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
    });

    it("displays current price values", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, minPrice: "100", maxPrice: "500" }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByDisplayValue("100")).toBeInTheDocument();
      expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    });

    it("calls onFiltersChange when min price changes", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      const minInput = screen.getByPlaceholderText("Min");
      await user.type(minInput, "1");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minPrice: "1",
      });
    });

    it("calls onFiltersChange when max price changes", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      const maxInput = screen.getByPlaceholderText("Max");
      await user.type(maxInput, "5");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        maxPrice: "5",
      });
    });
  });

  describe("customizable checkbox", () => {
    it("renders customizable checkbox", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByLabelText("Customizable only")).toBeInTheDocument();
    });

    it("reflects checked state", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, isCustomizable: true }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByLabelText("Customizable only")).toBeChecked();
    });

    it("calls onFiltersChange when toggled", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      await user.click(screen.getByLabelText("Customizable only"));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        isCustomizable: true,
      });
    });
  });

  describe("sort select", () => {
    it("renders sort dropdown", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays current sort option", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, sortBy: "BasePrice", sortDescending: false }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByRole("combobox")).toHaveValue("priceLow");
    });

    it("calls onFiltersChange when sort option changes", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "newest");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: "CreatedAt",
        sortDescending: true,
      });
    });
  });

  describe("clear filters", () => {
    it("renders clear filters button when filters are active", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, search: "pedals" }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });

    it("does not render clear button when no filters are active", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
    });

    it("resets all filters when clicked", async () => {
      const user = userEvent.setup();
      const filtersWithValues: FilterValues = {
        search: "pedals",
        categorySlug: "volantes",
        minPrice: "100",
        maxPrice: "500",
        isCustomizable: true,
        sortBy: "CreatedAt",
        sortDescending: true,
      };

      render(
        <ProductFilters
          filters={filtersWithValues}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      await user.click(screen.getByText("Clear filters"));

      expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters);
    });

    it("shows clear filters button when categorySlug is active", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, categorySlug: "volantes" }}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });
  });

  describe("category chips", () => {
    it("does not render category section when categories is empty", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.queryByText("Category")).not.toBeInTheDocument();
    });

    it("renders category heading when categories are provided", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("renders All categories chip", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      expect(screen.getByRole("button", { name: "All categories" })).toBeInTheDocument();
    });

    it("renders a chip for each category", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      expect(screen.getByRole("button", { name: "Volantes" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pedales" })).toBeInTheDocument();
    });

    it("clicking a category chip calls onFiltersChange with the slug", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByRole("button", { name: "Volantes" }));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        categorySlug: "volantes",
      });
    });

    it("clicking All categories chip resets categorySlug to empty string", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={{ ...defaultFilters, categorySlug: "volantes" }}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );

      await user.click(screen.getByRole("button", { name: "All categories" }));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        categorySlug: "",
      });
    });
  });

  describe("mobile toggle", () => {
    it("renders the mobile filters toggle button", () => {
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
    });

    it("shows active badge on mobile toggle when filters are active", () => {
      render(
        <ProductFilters
          filters={{ ...defaultFilters, search: "pedals" }}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      expect(screen.getByText("!")).toBeInTheDocument();
    });

    it("opens the mobile overlay when toggle is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ProductFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={[]}
        />
      );

      // Before click: only one h2 heading (desktop sidebar)
      expect(screen.getAllByRole("heading", { name: "Filters" })).toHaveLength(1);

      await user.click(screen.getByRole("button", { name: /filters/i }));

      // After click: overlay h2 also appears
      expect(screen.getAllByRole("heading", { name: "Filters" })).toHaveLength(2);
    });
  });
});
