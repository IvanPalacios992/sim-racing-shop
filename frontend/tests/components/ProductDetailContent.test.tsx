import { render, screen, waitFor } from "../helpers/render";
import { createMockProductDetail } from "../helpers/products";

vi.mock("@/lib/api/products", () => ({
  productsApi: {
    getProducts: vi.fn(),
    getProductBySlug: vi.fn(),
  },
}));

import { productsApi } from "@/lib/api/products";
import { ProductDetailContent } from "@/app/[locale]/productos/[slug]/ProductDetailContent";

describe("ProductDetailContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  describe("success state", () => {
    it("calls getProductBySlug with slug and locale", async () => {
      const product = createMockProductDetail();
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(
        product
      );

      render(<ProductDetailContent slug="formula-v25" />);

      await waitFor(() => {
        expect(productsApi.getProductBySlug).toHaveBeenCalledWith(
          "formula-v25",
          "en"
        );
      });
    });

    it("renders product name after loading", async () => {
      const product = createMockProductDetail({
        name: "Formula V2.5",
      });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(
        product
      );

      render(<ProductDetailContent slug="formula-v25" />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toHaveTextContent("Formula V2.5");
      });
    });

    it("renders specifications section when product has specs", async () => {
      const product = createMockProductDetail();
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(
        product
      );

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
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(
        product
      );

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "This is a detailed description of the product."
          )
        ).toBeInTheDocument();
      });
    });

    it("does not render long description section when null", async () => {
      const product = createMockProductDetail({
        longDescription: null,
      });
      vi.mocked(productsApi.getProductBySlug).mockResolvedValue(
        product
      );

      render(<ProductDetailContent slug="test" />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toHaveTextContent(product.name);
      });

      // The "Description" heading (h2) should not be present
      const headings = screen.getAllByRole("heading", { level: 2 });
      const descriptionHeading = headings.find(
        (h) => h.textContent === "Description"
      );
      expect(descriptionHeading).toBeUndefined();
    });
  });

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
          screen.getByText(
            "Could not load the product. Please try again."
          )
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
  });
});
