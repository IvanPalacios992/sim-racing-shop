import React from "react";
import { render, screen, waitFor, within } from "../../../helpers/render";
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

vi.mock("@/lib/api/admin-categories", () => ({
  adminCategoriesApi: {
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
import { adminCategoriesApi } from "@/lib/api/admin-categories";

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
const emptyCategoriesPaginated = { items: [], totalCount: 0, page: 1, pageSize: 200, totalPages: 0 };
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
    vi.mocked(adminCategoriesApi.list).mockResolvedValue(emptyCategoriesPaginated);
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
        expect(adminProductsApi.list).toHaveBeenCalledWith("es", 1, 10, "");
      });
    });

    it("carga categorías disponibles junto con productos y componentes", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => {
        expect(adminCategoriesApi.list).toHaveBeenCalledWith("es", 1, 200);
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

    it("al hacer clic en No oculta la confirmación", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Volante GT3")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "No" }));

      expect(screen.queryByText("¿Eliminar?")).not.toBeInTheDocument();
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

  describe("paginación", () => {
    it("no muestra paginación cuando hay una sola página", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(paginatedProducts(mockProducts));

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByText("Volante GT3")).toBeInTheDocument());

      expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
    });

    it("muestra paginación cuando hay múltiples páginas", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue({ ...paginatedProducts(mockProducts), totalPages: 4 });

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 4")).toBeInTheDocument();
      });
    });

    it("al hacer clic en 'Siguiente' carga la página 2", async () => {
      const user = userEvent.setup();
      const page2 = { items: [] as ProductListItem[], totalCount: 2, page: 2, pageSize: 10, totalPages: 2 };
      vi.mocked(adminProductsApi.list)
        .mockResolvedValueOnce({ ...paginatedProducts(mockProducts), totalPages: 2 })
        .mockResolvedValueOnce(page2);

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));

      await waitFor(() => {
        expect(adminProductsApi.list).toHaveBeenCalledWith("es", 2, 10, "");
      });
    });

    it("al hacer clic en 'Anterior' carga la página anterior", async () => {
      const user = userEvent.setup();
      const page2 = { items: [] as ProductListItem[], totalCount: 2, page: 2, pageSize: 10, totalPages: 2 };
      vi.mocked(adminProductsApi.list)
        .mockResolvedValueOnce({ ...paginatedProducts(mockProducts), totalPages: 2 })
        .mockResolvedValueOnce(page2)
        .mockResolvedValue({ ...paginatedProducts(mockProducts), totalPages: 2 });

      render(<ProductsContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));
      await waitFor(() => expect(adminProductsApi.list).toHaveBeenCalledWith("es", 2, 10, ""));

      await user.click(screen.getByRole("button", { name: /Anterior/ }));

      await waitFor(() => {
        expect(adminProductsApi.list).toHaveBeenCalledWith("es", 1, 10, "");
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

  describe("buscador", () => {
    it("muestra el input de búsqueda con el placeholder correcto", async () => {
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Buscar por nombre o SKU...")).toBeInTheDocument();
      });
    });

    it("el input de búsqueda es visible durante la carga", () => {
      vi.mocked(adminProductsApi.list).mockImplementation(() => new Promise(() => {}));

      render(<ProductsContent />);

      expect(screen.getByPlaceholderText("Buscar por nombre o SKU...")).toBeInTheDocument();
    });

    it("al escribir llama a la API con el término de búsqueda tras el debounce", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      await user.type(screen.getByPlaceholderText("Buscar por nombre o SKU..."), "GT3");

      await waitFor(() => {
        expect(adminProductsApi.list).toHaveBeenCalledWith("es", 1, 10, "GT3");
      });
    });

    it("la búsqueda no afecta a las llamadas de carga de datos auxiliares", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      await user.type(screen.getByPlaceholderText("Buscar por nombre o SKU..."), "GT3");

      await waitFor(() => expect(adminProductsApi.list).toHaveBeenCalledWith("es", 1, 10, "GT3"));

      // Los datos auxiliares (componentes y categorías para el modal) se cargan sin search
      expect(adminCategoriesApi.list).toHaveBeenCalledWith("es", 1, 200);
      expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 1, 200);
    });

    it("el botón limpiar aparece al escribir en el input", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "GT3");

      expect(within(input.closest("div") as HTMLElement).getByRole("button")).toBeInTheDocument();
    });

    it("al hacer clic en el botón limpiar se vacía el input", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "GT3");

      const clearButton = within(input.closest("div") as HTMLElement).getByRole("button");
      await user.click(clearButton);

      expect(input).toHaveValue("");
    });

    it("muestra mensaje dinámico cuando la búsqueda no devuelve resultados", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      await user.type(screen.getByPlaceholderText("Buscar por nombre o SKU..."), "xyz");

      await waitFor(() => {
        expect(screen.getByText('No se encontraron resultados para "xyz"')).toBeInTheDocument();
      });
    });

    it("al limpiar la búsqueda vuelve al mensaje de empty state estándar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.list).mockResolvedValue(emptyProductsPaginated);

      render(<ProductsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "xyz");
      await waitFor(() => screen.getByText('No se encontraron resultados para "xyz"'));

      const clearButton = within(input.closest("div") as HTMLElement).getByRole("button");
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("No hay productos creados")).toBeInTheDocument();
      });
    });
  });
});
