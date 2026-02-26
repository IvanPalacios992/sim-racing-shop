import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { ProductListItem } from "@/types/products";
import type { AdminComponentListItem } from "@/types/admin";

vi.mock("@/lib/api/admin-products", () => ({
  adminProductsApi: {
    create: vi.fn(),
    update: vi.fn(),
    updateTranslations: vi.fn(),
    getProductBothLocales: vi.fn(),
    getComponentOptions: vi.fn(),
  },
}));

vi.mock("@/components/admin/AdminModal", () => ({
  default: ({
    isOpen,
    title,
    children,
    onClose,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
  }) =>
    isOpen
      ? React.createElement(
          "div",
          null,
          React.createElement("h2", null, title),
          React.createElement("button", { onClick: onClose, "aria-label": "Cerrar modal" }, "X"),
          children,
        )
      : null,
}));

vi.mock("@/components/admin/products/ComponentOptionsPanel", () => ({
  default: ({ productId }: { productId: string }) =>
    React.createElement("div", { "data-testid": "component-options-panel" }, productId),
}));

vi.mock("@/components/admin/products/CategoryAssignPanel", () => ({
  default: ({ productId }: { productId: string }) =>
    React.createElement("div", { "data-testid": "category-assign-panel" }, productId),
}));

import ProductModal from "@/components/admin/products/ProductModal";
import { adminProductsApi } from "@/lib/api/admin-products";
import type { CategoryListItem } from "@/types/categories";

const availableComponents: AdminComponentListItem[] = [];
const availableCategories: CategoryListItem[] = [];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  availableComponents,
  availableCategories,
};

const mockEditItem: ProductListItem = {
  id: "prod-1",
  sku: "WHEEL-GT3-001",
  name: "Volante GT3",
  slug: "volante-gt3",
  basePrice: 299.99,
  vatRate: 21,
  isActive: true,
  isCustomizable: true,
  baseProductionDays: 7,
  weightGrams: null,
  model3dUrl: null,
  model3dSizeKb: null,
  shortDescription: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockProductDetail = {
  id: "prod-1",
  sku: "WHEEL-GT3-001",
  name: "Volante GT3",
  slug: "volante-gt3",
  basePrice: 299.99,
  vatRate: 21,
  isActive: true,
  isCustomizable: true,
  baseProductionDays: 7,
  weightGrams: null,
  model3dUrl: null,
  model3dSizeKb: null,
  shortDescription: null,
  longDescription: null,
  metaTitle: null,
  metaDescription: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("ProductModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("visibilidad", () => {
    it("no renderiza nada cuando isOpen es false", () => {
      const { container } = render(
        <ProductModal {...defaultProps} isOpen={false} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renderiza el modal cuando isOpen es true", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByText("Nuevo producto")).toBeInTheDocument();
    });
  });

  describe("creación", () => {
    it("muestra título 'Nuevo producto'", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByText("Nuevo producto")).toBeInTheDocument();
    });

    it("muestra pestañas General, Español, English (sin Componentes ni Categorías en modo creación)", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Componentes" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Categorías" })).not.toBeInTheDocument();
    });

    it("en pestaña General muestra campo SKU", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
    });

    it("en pestaña General muestra campos de precio e IVA", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByLabelText(/Precio base/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/IVA/i)).toBeInTheDocument();
    });

    it("en pestaña General muestra checkboxes Activo y Personalizable", () => {
      render(<ProductModal {...defaultProps} />);

      expect(screen.getByText("Activo")).toBeInTheDocument();
      expect(screen.getByText("Personalizable")).toBeInTheDocument();
    });

    it("en pestaña Español muestra campos de nombre y slug", async () => {
      const user = userEvent.setup();
      render(<ProductModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));

      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    });

    it("el slug se genera automáticamente al escribir el nombre en Español", async () => {
      const user = userEvent.setup();
      render(<ProductModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volante GT3");

      const slugInput = screen.getByLabelText(/Slug/i) as HTMLInputElement;
      expect(slugInput.value).toBe("volante-gt3");
    });

    it("llama a adminProductsApi.create al enviar el formulario", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.create).mockResolvedValue({} as never);

      render(<ProductModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/SKU/i), "WHEEL-GT3-001");
      await user.type(screen.getByLabelText(/Precio base/i), "299.99");

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volante GT3");

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminProductsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            sku: "WHEEL-GT3-001",
            basePrice: 299.99,
          }),
        );
      });
    });

    it("llama a onSuccess y onClose tras crear con éxito", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const onClose = vi.fn();
      vi.mocked(adminProductsApi.create).mockResolvedValue({} as never);

      render(
        <ProductModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
          availableComponents={[]}
        />,
      );

      await user.type(screen.getByLabelText(/SKU/i), "X");
      await user.type(screen.getByLabelText(/Precio base/i), "100");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("muestra mensaje de error cuando create falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.create).mockRejectedValue(new Error("Error del servidor"));

      render(<ProductModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/SKU/i), "X");
      await user.type(screen.getByLabelText(/Precio base/i), "100");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(screen.getByText("Error al crear el producto")).toBeInTheDocument();
      });
    });
  });

  describe("edición", () => {
    it("muestra título 'Editar producto'", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByText("Editar producto")).toBeInTheDocument();
      });
    });

    it("muestra pestaña 'Componentes' en modo edición", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Componentes" })).toBeInTheDocument();
      });
    });

    it("carga getProductBothLocales al abrir en modo edición", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(adminProductsApi.getProductBothLocales).toHaveBeenCalledWith("prod-1");
      });
    });

    it("precarga el precio base", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.queryByText("Cargando traducciones...")).not.toBeInTheDocument();
      });

      const priceInput = screen.getByLabelText(/Precio base/i) as HTMLInputElement;
      expect(priceInput.value).toBe("299.99");
    });

    it("llama a update y updateTranslations al guardar en edición", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);
      vi.mocked(adminProductsApi.update).mockResolvedValue({} as never);
      vi.mocked(adminProductsApi.updateTranslations).mockResolvedValue({} as never);

      const user = userEvent.setup();
      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.queryByText("Cargando traducciones...")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminProductsApi.update).toHaveBeenCalledWith(
          "prod-1",
          expect.objectContaining({ basePrice: 299.99 }),
        );
      });
    });

    it("muestra el panel de componentes al hacer clic en la pestaña Componentes", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Componentes" })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Componentes" }));

      expect(screen.getByTestId("component-options-panel")).toBeInTheDocument();
    });

    it("muestra pestaña 'Categorías' en modo edición", async () => {
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Categorías" })).toBeInTheDocument();
      });
    });

    it("muestra el panel de categorías al hacer clic en la pestaña Categorías", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Categorías" })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Categorías" }));

      expect(screen.getByTestId("category-assign-panel")).toBeInTheDocument();
    });

    it("el panel de categorías no se muestra cuando la pestaña activa es otra", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getProductBothLocales).mockResolvedValue({
        es: mockProductDetail,
        en: { ...mockProductDetail, name: "GT3 Steering Wheel", slug: "gt3-steering-wheel" },
      } as never);

      render(<ProductModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Componentes" })).toBeInTheDocument();
      });

      // La pestaña General está activa por defecto
      expect(screen.queryByTestId("category-assign-panel")).not.toBeInTheDocument();

      // Cambiar a Componentes tampoco debe mostrar el panel de categorías
      await user.click(screen.getByRole("button", { name: "Componentes" }));
      expect(screen.queryByTestId("category-assign-panel")).not.toBeInTheDocument();
    });
  });
});
