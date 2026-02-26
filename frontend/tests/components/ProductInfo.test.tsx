import { render, screen } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import { ProductInfo } from "@/components/products/ProductInfo";
import { createMockProductDetail } from "../helpers/products";

describe("ProductInfo", () => {
  describe("rendering", () => {
    it("renders the product name as heading", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      expect(
        screen.getByRole("heading", { level: 1 })
      ).toHaveTextContent("Formula V2.5 Steering Wheel");
    });

    it("renders the SKU", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      expect(screen.getByText(/WHL-F-V25/)).toBeInTheDocument();
    });

    it("calculates and displays price with VAT", () => {
      const product = createMockProductDetail({
        basePrice: 100,
        vatRate: 21,
      });
      render(<ProductInfo product={product} />);

      // 100 * 1.21 = 121.00
      expect(screen.getByText(/121\.00/)).toBeInTheDocument();
    });

    it("displays base price without VAT", () => {
      const product = createMockProductDetail({
        basePrice: 100,
        vatRate: 21,
      });
      render(<ProductInfo product={product} />);

      expect(screen.getByText(/100\.00/)).toBeInTheDocument();
    });

    it("displays VAT rate", () => {
      const product = createMockProductDetail({ vatRate: 21 });
      render(<ProductInfo product={product} />);

      expect(screen.getByText(/21/)).toBeInTheDocument();
    });
  });

  describe("stock status", () => {
    it("shows 'In stock' when product is active", () => {
      const product = createMockProductDetail({ isActive: true });
      render(<ProductInfo product={product} />);

      expect(screen.getByText("In stock")).toBeInTheDocument();
    });

    it("shows 'Out of stock' when product is not active", () => {
      const product = createMockProductDetail({ isActive: false });
      render(<ProductInfo product={product} />);

      expect(screen.getByText("Out of stock")).toBeInTheDocument();
    });
  });

  describe("customizable product", () => {
    it("shows 'Customizable' badge when product is customizable", () => {
      const product = createMockProductDetail({ isCustomizable: true });
      render(<ProductInfo product={product} />);

      expect(screen.getByText("Customizable")).toBeInTheDocument();
    });

    it("shows 'CUSTOMIZE' button when product is customizable", () => {
      const product = createMockProductDetail({ isCustomizable: true });
      render(<ProductInfo product={product} />);

      expect(
        screen.getByRole("button", { name: "CUSTOMIZE" })
      ).toBeInTheDocument();
    });

    it("does not show 'Customizable' badge or CUSTOMIZE button when product is not customizable", () => {
      const product = createMockProductDetail({ isCustomizable: false });
      render(<ProductInfo product={product} />);

      expect(screen.queryByText("Customizable")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "CUSTOMIZE" })
      ).not.toBeInTheDocument();
    });

    it("shows ADD TO CART button when product is not customizable", () => {
      const product = createMockProductDetail({ isCustomizable: false });
      render(<ProductInfo product={product} />);

      expect(
        screen.getByRole("button", { name: "ADD TO CART" })
      ).toBeInTheDocument();
    });

    it("calls onAddToCart when ADD TO CART button is clicked", async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();
      const product = createMockProductDetail({ isCustomizable: false });
      render(<ProductInfo product={product} onAddToCart={onAddToCart} />);

      await user.click(screen.getByRole("button", { name: "ADD TO CART" }));

      expect(onAddToCart).toHaveBeenCalledTimes(1);
    });

    it("disables ADD TO CART button when isAddingToCart is true", () => {
      const product = createMockProductDetail({ isCustomizable: false });
      render(<ProductInfo product={product} isAddingToCart={true} />);

      expect(
        screen.getByRole("button", { name: "ADD TO CART" })
      ).toBeDisabled();
    });
  });

  describe("conditional sections", () => {
    it("renders short description when present", () => {
      const product = createMockProductDetail({
        shortDescription: "A great product",
      });
      render(<ProductInfo product={product} />);

      expect(screen.getByText("A great product")).toBeInTheDocument();
    });

    it("does not render short description when null", () => {
      const product = createMockProductDetail({
        shortDescription: null,
      });
      render(<ProductInfo product={product} />);

      expect(
        screen.queryByText("A great product")
      ).not.toBeInTheDocument();
    });

    it("renders production time", () => {
      const product = createMockProductDetail({
        baseProductionDays: 7,
      });
      render(<ProductInfo product={product} />);

      expect(screen.getByText(/7 days/)).toBeInTheDocument();
    });

    it("renders weight when available", () => {
      const product = createMockProductDetail({ weightGrams: 1200 });
      render(<ProductInfo product={product} />);

      expect(screen.getByText(/1200/)).toBeInTheDocument();
    });

    it("does not render weight when null", () => {
      const product = createMockProductDetail({ weightGrams: null });
      render(<ProductInfo product={product} />);

      expect(screen.queryByText(/Weight:/)).not.toBeInTheDocument();
    });
  });

  describe("breadcrumb navigation", () => {
    it("has link to home", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("has link to products listing", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink).toHaveAttribute("href", "/productos");
    });

    it("shows current product name as plain text", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      const nav = screen.getByLabelText("breadcrumb");
      expect(nav).toHaveTextContent("Formula V2.5 Steering Wheel");
    });
  });

  describe("trust indicators", () => {
    it("shows free shipping indicator", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      expect(
        screen.getByText("Free shipping on orders over €100")
      ).toBeInTheDocument();
    });

    it("shows warranty indicator", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      expect(
        screen.getByText("2-year warranty included")
      ).toBeInTheDocument();
    });

    it("shows secure payment indicator", () => {
      const product = createMockProductDetail();
      render(<ProductInfo product={product} />);

      expect(
        screen.getByText("Secure payment with SSL encryption")
      ).toBeInTheDocument();
    });
  });
});
