import React from "react";
import { render, screen, waitFor } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { CustomizationGroup, CustomizationOption } from "@/types/products";
import { createMockProductDetail } from "../../helpers/products";

// Mock next/dynamic to return a stub component (Three.js unavailable in jsdom)
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
import { ProductConfigurator } from "@/components/configurator/ProductConfigurator";

// ─── Helpers ────────────────────────────────────────────────────────────────

function createMockOption(
  overrides?: Partial<CustomizationOption>
): CustomizationOption {
  return {
    componentId: "opt-1",
    name: "Black",
    description: null,
    glbObjectName: null,
    thumbnailUrl: null,
    priceModifier: 0,
    isDefault: true,
    displayOrder: 0,
    inStock: true,
    ...overrides,
  };
}

function createMockGroup(
  overrides?: Partial<CustomizationGroup>
): CustomizationGroup {
  return {
    name: "Color",
    isRequired: true,
    options: [createMockOption()],
    ...overrides,
  };
}

const baseProduct = createMockProductDetail({ basePrice: 100, vatRate: 10 });

const defaultProps = {
  product: baseProduct,
  onClose: vi.fn(),
  onAddToCart: vi.fn().mockResolvedValue(undefined),
  isAddingToCart: false,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("ProductConfigurator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([]);
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders dialog with role and aria-modal", () => {
      render(<ProductConfigurator {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("dialog aria-label contains product name", () => {
      const product = createMockProductDetail({ name: "Formula V2.5" });
      render(<ProductConfigurator {...defaultProps} product={product} />);
      expect(
        screen.getByRole("dialog", { name: /Formula V2\.5/ })
      ).toBeInTheDocument();
    });

    it("shows product name in the header", () => {
      const product = createMockProductDetail({ name: "Formula V2.5" });
      render(<ProductConfigurator {...defaultProps} product={product} />);
      expect(screen.getByText("Formula V2.5")).toBeInTheDocument();
    });

    it("renders close button with correct aria-label", () => {
      render(<ProductConfigurator {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "Close configurator" })
      ).toBeInTheDocument();
    });

    it("shows no-model placeholder when product has no model3dUrl", async () => {
      const product = createMockProductDetail({ model3dUrl: null });
      render(<ProductConfigurator {...defaultProps} product={product} />);
      await waitFor(() => {
        expect(
          screen.getByText("No 3D model available for this product")
        ).toBeInTheDocument();
      });
    });

    it("renders ConfiguratorViewer stub when product has model3dUrl", () => {
      const product = createMockProductDetail({
        model3dUrl: "/models/product.glb",
      });
      render(<ProductConfigurator {...defaultProps} product={product} />);
      expect(screen.getByTestId("configurator-viewer")).toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows loading skeleton while API is pending", () => {
      vi.mocked(productsApi.getProductCustomizations).mockImplementation(
        () => new Promise(() => {})
      );
      const { container } = render(<ProductConfigurator {...defaultProps} />);
      expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    });

    it("shows loading text while API is pending", () => {
      vi.mocked(productsApi.getProductCustomizations).mockImplementation(
        () => new Promise(() => {})
      );
      render(<ProductConfigurator {...defaultProps} />);
      expect(
        screen.getByText("Loading customization options...")
      ).toBeInTheDocument();
    });
  });

  // ── Data loading ───────────────────────────────────────────────────────────

  describe("data loading", () => {
    it("calls getProductCustomizations with product id and locale", async () => {
      const product = createMockProductDetail({ id: "prod-42" });
      render(<ProductConfigurator {...defaultProps} product={product} />);
      await waitFor(() => {
        expect(productsApi.getProductCustomizations).toHaveBeenCalledWith(
          "prod-42",
          "en"
        );
      });
    });

    it("renders group names after customizations are loaded", async () => {
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([
        createMockGroup({ name: "Color" }),
        createMockGroup({ name: "Material", isRequired: false }),
      ]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Color")).toBeInTheDocument();
        expect(screen.getByText("Material")).toBeInTheDocument();
      });
    });

    it("shows no-options message when there are no customization groups", async () => {
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "This product has no customization options configured"
          )
        ).toBeInTheDocument();
      });
    });

    it("auto-selects the default in-stock option on load", async () => {
      const defaultOption = createMockOption({
        componentId: "opt-default",
        isDefault: true,
        inStock: true,
      });
      const group = createMockGroup({
        name: "Color",
        isRequired: true,
        options: [defaultOption],
      });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      // The default option should be auto-selected → button enabled
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).not.toBeDisabled();
      });
    });
  });

  // ── Price calculation ──────────────────────────────────────────────────────

  describe("price calculation", () => {
    it("shows base price with VAT applied", async () => {
      // 100 * (1 + 10/100) = 110.00  — price footer renders only when groups exist
      const product = createMockProductDetail({ basePrice: 100, vatRate: 10 });
      const group = createMockGroup({
        options: [createMockOption({ isDefault: true, inStock: true })],
      });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} product={product} />);

      // Wait for loading to finish, then confirm price label and value are shown
      await waitFor(() => {
        expect(screen.getByText("Base price")).toBeInTheDocument();
      });
      // Price amount uses € sign — match via regex to avoid encoding edge cases
      expect(document.body.textContent).toContain("110.00");
    });

    it("shows total price including price modifier of the auto-selected option", async () => {
      // basePrice=100, vatRate=0 → basePriceWithVat=100; modifier=25 → total=125
      const product = createMockProductDetail({ basePrice: 100, vatRate: 0 });
      const option = createMockOption({
        componentId: "opt-red",
        priceModifier: 25,
        isDefault: true,
        inStock: true,
      });
      const group = createMockGroup({
        name: "Color",
        isRequired: true,
        options: [option],
      });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} product={product} />);

      await waitFor(() => {
        expect(screen.getByText("Total")).toBeInTheDocument();
      });
      // Total = 100 (base) + 25 (modifier) = 125
      expect(document.body.textContent).toContain("125.00");
    });

    it("shows extras line when selected option has a positive price modifier", async () => {
      const option = createMockOption({ priceModifier: 25, isDefault: true, inStock: true });
      const group = createMockGroup({ options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Extras")).toBeInTheDocument();
      });
    });

    it("does not show extras line when there are no price modifiers", async () => {
      const option = createMockOption({ priceModifier: 0, isDefault: true, inStock: true });
      const group = createMockGroup({ options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText("Extras")).not.toBeInTheDocument();
      });
    });
  });

  // ── Add to cart: enabled / disabled ───────────────────────────────────────

  describe("add to cart button state", () => {
    it("is enabled when all required groups have a selection", async () => {
      const option = createMockOption({ isDefault: true, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).not.toBeDisabled();
      });
    });

    it("is disabled when a required group has no selection", async () => {
      // No default option → initial selection is null
      const option = createMockOption({ isDefault: false, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).toBeDisabled();
      });
    });

    it("shows missing-required warning when a required group is unselected", async () => {
      const option = createMockOption({ isDefault: false, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Please select all required options to continue")
        ).toBeInTheDocument();
      });
    });

    it("is disabled while isAddingToCart is true", async () => {
      const option = createMockOption({ isDefault: true, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(<ProductConfigurator {...defaultProps} isAddingToCart={true} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).toBeDisabled();
      });
    });
  });

  // ── Close behavior ────────────────────────────────────────────────────────

  describe("close behavior", () => {
    it("calls onClose when the close button is clicked", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<ProductConfigurator {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Close configurator" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<ProductConfigurator {...defaultProps} onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("sets body overflow to hidden while mounted", () => {
      render(<ProductConfigurator {...defaultProps} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body overflow on unmount", () => {
      const { unmount } = render(<ProductConfigurator {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // ── Add to cart: interaction ───────────────────────────────────────────────

  describe("add to cart interaction", () => {
    it("calls onAddToCart with current selections and total price", async () => {
      const onAddToCart = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      const user = userEvent.setup();

      // vatRate=0 to avoid floating-point imprecision in the assertion
      const product = createMockProductDetail({ basePrice: 100, vatRate: 0 });
      const option = createMockOption({
        componentId: "opt-black",
        priceModifier: 0,
        isDefault: true,
        inStock: true,
      });
      const group = createMockGroup({
        name: "Color",
        isRequired: true,
        options: [option],
      });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(
        <ProductConfigurator
          product={product}
          onClose={onClose}
          onAddToCart={onAddToCart}
          isAddingToCart={false}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).not.toBeDisabled();
      });

      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith(
          { Color: "opt-black" },
          100,
          [{ groupName: "Color", componentId: "opt-black", componentName: "Black" }]
        );
      });
    });

    it("calls onClose after onAddToCart resolves", async () => {
      const onAddToCart = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      const user = userEvent.setup();

      const option = createMockOption({ isDefault: true, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(
        <ProductConfigurator
          product={defaultProps.product}
          onClose={onClose}
          onAddToCart={onAddToCart}
          isAddingToCart={false}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).not.toBeDisabled();
      });

      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call onAddToCart when the button is disabled", async () => {
      const onAddToCart = vi.fn();
      // Required group with no default → canAddToCart=false → button disabled
      const option = createMockOption({ isDefault: false, inStock: true });
      const group = createMockGroup({ isRequired: true, options: [option] });
      vi.mocked(productsApi.getProductCustomizations).mockResolvedValue([group]);

      render(
        <ProductConfigurator
          product={defaultProps.product}
          onClose={vi.fn()}
          onAddToCart={onAddToCart}
          isAddingToCart={false}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /add to cart/i })
        ).toBeDisabled();
      });

      expect(onAddToCart).not.toHaveBeenCalled();
    });
  });
});
