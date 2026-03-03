import React from "react";
import { render, screen, waitFor } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import { createMockProductDetail } from "../helpers/products";
import { useCartStore } from "@/stores/cart-store";
import { resetCartStore } from "../helpers/cart";

// Mock next/dynamic to avoid importing Three.js in jsdom
vi.mock("next/dynamic", () => ({
  default: () => () =>
    React.createElement("div", { "data-testid": "configurator-viewer" }),
}));

vi.mock("@/lib/api/products", () => ({
  productsApi: {
    getProducts: vi.fn(),
    getProductBySlug: vi.fn(),
    getProductCustomizations: vi.fn(),
  },
}));

import { productsApi } from "@/lib/api/products";
import { ProductDetailContent } from "@/app/[locale]/productos/[slug]/ProductDetailContent";

describe("ProductDetailContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCartStore();
    vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([]);
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows skeleton while loading", () => {
      vi.mocked(productsApi.getProductBySlug).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(
        <ProductDetailContent slug="test-product" />
      );

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ── Success ────────────────────────────────────────────────────────────────

  describe("success state", () => {
    it("calls getProductBySlug with slug and locale", async () => {
      const product = createMockProductDetail();
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="formula-v25" />);

      await waitFor(() => {
        expect(productsApi.getProductBySlug).toHaveBeenCalledWith(
          "formula-v25",
          "en"
        );
      });
    });

    it("renders product name after loading", async () => {
      const product = createMockProductDetail({ name: "Formula V2.5" });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="formula-v25" />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toHaveTextContent("Formula V2.5");
      });
    });

    it("renders specifications section when product has specs", async () => {
      const product = createMockProductDetail();
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByText("Technical Specifications")
        ).toBeInTheDocument();
      });
    });

    it("renders long description when present", async () => {
      const product = createMockProductDetail({
        longDescription: "This is a detailed description of the product.",
      });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByText("This is a detailed description of the product.")
        ).toBeInTheDocument();
      });
    });

    it("does not render long description section when null", async () => {
      const product = createMockProductDetail({ longDescription: null });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toHaveTextContent(product.name);
      });

      const headings = screen.getAllByRole("heading", { level: 2 });
      const descriptionHeading = headings.find(
        (h) => h.textContent === "Description"
      );
      expect(descriptionHeading).toBeUndefined();
    });
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  describe("error state", () => {
    it("shows error message when API fails", async () => {
      vi.mocked(productsApi.getProductBySlug).mockRejectedValue(
        new Error("Not found")
      );

      render(<ProductDetailContent slug="nonexistent" />);

      await waitFor(() => {
        expect(
          screen.getByText("Error loading product")
        ).toBeInTheDocument();
      });
    });

    it("shows error description", async () => {
      vi.mocked(productsApi.getProductBySlug).mockRejectedValue(
        new Error("Not found")
      );

      render(<ProductDetailContent slug="nonexistent" />);

      await waitFor(() => {
        expect(
          screen.getByText("Could not load the product. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("shows retry button on error", async () => {
      vi.mocked(productsApi.getProductBySlug).mockRejectedValue(
        new Error("Not found")
      );

      render(<ProductDetailContent slug="nonexistent" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Retry" })
        ).toBeInTheDocument();
      });
    });

    it("retry button calls window.location.reload", async () => {
      vi.mocked(productsApi.getProductBySlug).mockRejectedValue(
        new Error("Not found")
      );
      const reload = vi.fn();
      Object.defineProperty(window, "location", {
        value: { ...window.location, reload },
        writable: true,
      });
      const user = userEvent.setup();

      render(<ProductDetailContent slug="nonexistent" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
      );

      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  // ── Configurator integration ───────────────────────────────────────────────

  describe("configurator integration", () => {
    it("shows CUSTOMIZE button for customizable products", async () => {
      const product = createMockProductDetail({ isCustomizable: true });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "CUSTOMIZE" })
        ).toBeInTheDocument();
      });
    });

    it("does not show CUSTOMIZE button when product is not customizable", async () => {
      const product = createMockProductDetail({ isCustomizable: false });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: "CUSTOMIZE" })
      ).not.toBeInTheDocument();
    });

    it("shows ADD TO CART button for non-customizable products", async () => {
      const product = createMockProductDetail({ isCustomizable: false });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "ADD TO CART" })
        ).toBeInTheDocument();
      });
    });

    it("clicking ADD TO CART calls addItem with empty component arrays for non-customizable products", async () => {
      const mockAddItem = vi.fn().mockResolvedValue(undefined);
      useCartStore.setState({ addItem: mockAddItem } as never);

      const product = createMockProductDetail({ isCustomizable: false, id: "prod-nc" });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);
      const user = userEvent.setup();

      render(<ProductDetailContent slug="test" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "ADD TO CART" })).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: "ADD TO CART" }));

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith("prod-nc", 1, "en", [], []);
      });
    });

    it("opens the configurator overlay when CUSTOMIZE is clicked", async () => {
      const product = createMockProductDetail({ isCustomizable: true });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);
      const user = userEvent.setup();

      render(<ProductDetailContent slug="test" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "CUSTOMIZE" })).toBeInTheDocument()
      );

      await user.click(screen.getByRole("button", { name: "CUSTOMIZE" }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes the configurator when onClose is called", async () => {
      const product = createMockProductDetail({ isCustomizable: true });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);
      const user = userEvent.setup();

      render(<ProductDetailContent slug="test" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "CUSTOMIZE" })).toBeInTheDocument()
      );

      await user.click(screen.getByRole("button", { name: "CUSTOMIZE" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Close configurator" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls cart addItem with selected component IDs when onAddToCart is triggered", async () => {
      const mockAddItem = vi.fn().mockResolvedValue(undefined);
      useCartStore.setState({ addItem: mockAddItem } as never);

      const product = createMockProductDetail({ isCustomizable: true, id: "prod-1" });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([
        {
          name: "Color",
          isRequired: true,
          options: [
            {
              componentId: "opt-black",
              name: "Black",
              description: null,
              glbObjectName: null,
              thumbnailUrl: null,
              priceModifier: 0,
              isDefault: true,
              displayOrder: 0,
              inStock: true,
            },
          ],
        },
      ]);
      const user = userEvent.setup();

      render(<ProductDetailContent slug="test" />);

      // Open configurator
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "CUSTOMIZE" })).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: "CUSTOMIZE" }));

      // Wait for customization groups to load and button to be enabled
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).not.toBeDisabled()
      );

      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          "prod-1",
          1,
          "en",
          ["opt-black"],
          [{ groupName: "Color", componentId: "opt-black", componentName: "Black" }]
        );
      });
    });

    it("filters out null selections before calling addItem", async () => {
      const mockAddItem = vi.fn().mockResolvedValue(undefined);
      useCartStore.setState({ addItem: mockAddItem } as never);

      const product = createMockProductDetail({ isCustomizable: true, id: "prod-1" });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(product);
      // One required group with default, one optional group with no selection (null)
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([
        {
          name: "Color",
          isRequired: true,
          options: [
            { componentId: "opt-black", name: "Black", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
          ],
        },
        {
          name: "Grip",
          isRequired: false,
          options: [
            { componentId: "opt-grip", name: "Rubber", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: false, displayOrder: 0, inStock: true },
          ],
        },
      ]);
      const user = userEvent.setup();

      render(<ProductDetailContent slug="test" />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "CUSTOMIZE" })).toBeInTheDocument()
      );
      await user.click(screen.getByRole("button", { name: "CUSTOMIZE" }));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: /add to cart/i })).not.toBeDisabled()
      );
      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      await waitFor(() => {
        // Only the non-null selection (Color) should be passed — Grip stays null
        expect(mockAddItem).toHaveBeenCalledWith(
          "prod-1",
          1,
          "en",
          ["opt-black"],
          [{ groupName: "Color", componentId: "opt-black", componentName: "Black" }]
        );
      });
    });
  });
});
