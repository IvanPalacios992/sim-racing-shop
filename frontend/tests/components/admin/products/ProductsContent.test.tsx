import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import type { ProductListItem } from "@/types/products";

vi.mock("@/lib/api/admin-products", () => ({
  adminProductsApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/api/admin-components", () => ({
  adminComponentsApi: {
    list: vi.fn(),
  },
}));

vi.mock("@/components/admin/products/ProductModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen
      ? React.createElement("div", { "data-testid": "product-modal" }, "ProductModal")
      : null,
}));

import ProductsContent from "@/components/admin/products/ProductsContent";
import { adminProductsApi } from "@/lib/api/admin-products";
import { adminComponentsApi } from "@/lib/api/admin-components";

const mockProducts: ProductListItem[] = [
  {
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
  },
  {
    id: "prod-2",
    sku: "PEDALS-001",
    name: "Pedales de carrera",
    slug: "pedales-carrera",
    basePrice: 149.99,
    vatRate: 21,
    isActive: false,
    isCustomizable: false,
    baseProductionDays: 5,
    weightGrams: null,
    model3dUrl: null,
    model3dSizeKb: null,
    shortDescription: null,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

const emptyProductsPaginated = { items: [] as ProductListItem[], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };
const emptyComponentsPaginated = { items: [], totalCount: 0, page: 1, pageSize: 200, totalPages: 0 };
const paginatedProducts = (items: ProductListItem[]) => ({
  items,
  totalCount: items.length,
  page: 1,
  pageSize: 10,
  totalPages: items.length > 0 ? 1 : 0,
});

describe("ProductsContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(createMockAuthResponse());
    useAuthStore.setState({ _hasHydrated: true });
    vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyComponentsPaginated);
  });

  describe("loading", () => {
    it("muestra skeleton mientras carga", () => {
      vi.mocked(adminProductsApi.list).mockImplementation(() => new Promise(() => {}));

      render(<ProductsContent />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("no llama a la API hasta que el store está hidratado", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<ProductsContent />);

      expect(adminProductsApi.list).not.toHaveBeenCalled();
    });

    it("llama a adminProductsApi.list con locale 'es'", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => {
        expect(adminProductsApi.list).toHaveBeenCalledWith("es", 1, 10);
      });
    });
  });

  describe("error", () => {
    it("muestra mensaje de error cuando la API falla", async () => {
      vi.mocked(adminProductsApi.list).mockRejectedValue(new Error("Network error"));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar productos")).toBeInTheDocument();
      });
    });

    it("muestra botón Reintentar al fallar", async () => {
      vi.mocked(adminProductsApi.list).mockRejectedValue(new Error("Network error"));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });

    it("vuelve a cargar al hacer clic en Reintentar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list)
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValueOnce(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
      await user.click(screen.getByText("Reintentar"));

      await waitFor(() => {
        expect(adminProductsApi.list).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("empty state", () => {
    it("muestra mensaje cuando no hay productos", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("No hay productos creados")).toBeInTheDocument();
      });
    });
  });

  describe("tabla", () => {
    it("renderiza el título de la página", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Productos")).toBeInTheDocument();
      });
    });

    it("renderiza las cabeceras de columna", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("SKU")).toBeInTheDocument();
        expect(screen.getByText("Nombre")).toBeInTheDocument();
        expect(screen.getByText("Precio base")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Personalizable")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
      });
    });

    it("renderiza los nombres de los productos", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Volante GT3")).toBeInTheDocument();
        expect(screen.getByText("Pedales de carrera")).toBeInTheDocument();
      });
    });

    it("renderiza el precio con formato correcto", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("299.99 €")).toBeInTheDocument();
      });
    });

    it("muestra badge 'Activo' para productos activos", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Activo")).toBeInTheDocument();
      });
    });

    it("muestra badge 'Inactivo' para productos inactivos", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Inactivo")).toBeInTheDocument();
      });
    });

    it("muestra 'Sí' para productos personalizables", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Sí")).toBeInTheDocument();
      });
    });

    it("muestra 'No' para productos no personalizables", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("No")).toBeInTheDocument();
      });
    });
  });

  describe("eliminar", () => {
    it("al hacer clic en eliminar muestra confirmación inline", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Volante GT3")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
    });

    it("al confirmar llama a delete con el id correcto", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));
      vi.mocked(adminProductsApi.delete).mockResolvedValue(undefined);

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Volante GT3")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminProductsApi.delete).toHaveBeenCalledWith("prod-1");
      });
    });
  });

  describe("modal creación", () => {
    it("al hacer clic en 'Nuevo producto' abre el modal", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Nuevo producto")).toBeInTheDocument());

      await user.click(screen.getByText("Nuevo producto"));

      expect(screen.getByTestId("product-modal")).toBeInTheDocument();
    });
  });
});
