import React from "react";
import { render, screen, waitFor, within } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import type { AdminComponentListItem } from "@/types/admin";

vi.mock("@/lib/api/admin-components", () => ({
  adminComponentsApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/components/admin/components/ComponentModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen
      ? React.createElement("div", { "data-testid": "component-modal" }, "ComponentModal")
      : null,
}));

import ComponentsContent from "@/components/admin/components/ComponentsContent";
import { adminComponentsApi } from "@/lib/api/admin-components";

const mockEsComponents: AdminComponentListItem[] = [
  {
    id: "comp-1",
    sku: "WHEEL-BASE-001",
    name: "Base de volante DD Pro",
    componentType: "WheelBase",
    stockQuantity: 10,
    inStock: true,
    weightGrams: 2500,
  },
  {
    id: "comp-2",
    sku: "PEDALS-001",
    name: "Pedales Sprint",
    componentType: "Pedals",
    stockQuantity: 0,
    inStock: false,
    weightGrams: 1800,
  },
];

const mockEnComponents: AdminComponentListItem[] = [
  {
    id: "comp-1",
    sku: "WHEEL-BASE-001",
    name: "DD Pro Wheel Base",
    componentType: "WheelBase",
    stockQuantity: 10,
    inStock: true,
    weightGrams: 2500,
  },
  {
    id: "comp-2",
    sku: "PEDALS-001",
    name: "Sprint Pedals",
    componentType: "Pedals",
    stockQuantity: 0,
    inStock: false,
    weightGrams: 1800,
  },
];

const emptyPaginated = { items: [] as AdminComponentListItem[], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };
const paginated = (items: AdminComponentListItem[]) => ({
  items,
  totalCount: items.length,
  page: 1,
  pageSize: 10,
  totalPages: items.length > 0 ? 1 : 0,
});

describe("ComponentsContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(createMockAuthResponse());
    useAuthStore.setState({ _hasHydrated: true });
  });

  describe("loading", () => {
    it("muestra skeleton mientras carga", () => {
      vi.mocked(adminComponentsApi.list).mockImplementation(() => new Promise(() => {}));

      render(<ComponentsContent />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("no llama a la API hasta que el store está hidratado", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<ComponentsContent />);

      expect(adminComponentsApi.list).not.toHaveBeenCalled();
    });

    it("llama a list dos veces (es y en)", async () => {
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledTimes(2);
        expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 1, 10, "");
        expect(adminComponentsApi.list).toHaveBeenCalledWith("en", 1, 10, "");
      });
    });
  });

  describe("error", () => {
    it("muestra mensaje de error cuando la API falla", async () => {
      vi.mocked(adminComponentsApi.list).mockRejectedValue(new Error("Network error"));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar componentes")).toBeInTheDocument();
      });
    });

    it("muestra botón Reintentar al fallar", async () => {
      vi.mocked(adminComponentsApi.list).mockRejectedValue(new Error("Network error"));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });

    it("vuelve a cargar al hacer clic en Reintentar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list)
        .mockRejectedValueOnce(new Error("error"))
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
      await user.click(screen.getByText("Reintentar"));

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledTimes(4); // 2 locales x 2 intentos
      });
    });
  });

  describe("empty state", () => {
    it("muestra mensaje cuando no hay componentes", async () => {
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("No hay componentes creados")).toBeInTheDocument();
      });
    });
  });

  describe("tabla", () => {
    it("renderiza el título de la página", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Componentes")).toBeInTheDocument();
      });
    });

    it("renderiza las cabeceras de columna", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("SKU")).toBeInTheDocument();
        expect(screen.getByText("Nombre")).toBeInTheDocument();
        expect(screen.getByText("Tipo")).toBeInTheDocument();
        expect(screen.getByText("Stock")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
      });
    });

    it("renderiza los nombres en español de los componentes", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument();
        expect(screen.getByText("Pedales Sprint")).toBeInTheDocument();
      });
    });

    it("muestra 'En stock' para componentes con stock", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText(/En stock/)).toBeInTheDocument();
      });
    });

    it("muestra 'Agotado' para componentes sin stock", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText(/Agotado/)).toBeInTheDocument();
      });
    });
  });

  describe("eliminar", () => {
    it("al hacer clic en eliminar muestra confirmación inline", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
    });

    it("al hacer clic en No oculta la confirmación", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "No" }));

      expect(screen.queryByText("¿Eliminar?")).not.toBeInTheDocument();
    });

    it("al confirmar llama a delete con el id correcto", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));
      vi.mocked(adminComponentsApi.delete).mockResolvedValue(undefined);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminComponentsApi.delete).toHaveBeenCalledWith("comp-1");
      });
    });
  });

  describe("paginación", () => {
    it("no muestra paginación cuando hay una sola página", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(paginated(mockEsComponents))
        .mockResolvedValueOnce(paginated(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument());

      expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
    });

    it("muestra paginación cuando hay múltiples páginas", async () => {
      const multiPage = (items: AdminComponentListItem[]) => ({ ...paginated(items), totalPages: 3 });
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(multiPage(mockEsComponents))
        .mockResolvedValueOnce(multiPage(mockEnComponents));

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
      });
    });

    it("al hacer clic en 'Siguiente' carga la página 2", async () => {
      const user = userEvent.setup();
      const page2 = { items: [] as AdminComponentListItem[], totalCount: 2, page: 2, pageSize: 10, totalPages: 2 };
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce({ ...paginated(mockEsComponents), totalPages: 2 })
        .mockResolvedValueOnce({ ...paginated(mockEnComponents), totalPages: 2 })
        .mockResolvedValueOnce(page2)
        .mockResolvedValueOnce(page2);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 2, 10, "");
        expect(adminComponentsApi.list).toHaveBeenCalledWith("en", 2, 10, "");
      });
    });

    it("al hacer clic en 'Anterior' carga la página anterior", async () => {
      const user = userEvent.setup();
      const page2 = { items: [] as AdminComponentListItem[], totalCount: 2, page: 2, pageSize: 10, totalPages: 2 };
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce({ ...paginated(mockEsComponents), totalPages: 2 })
        .mockResolvedValueOnce({ ...paginated(mockEnComponents), totalPages: 2 })
        .mockResolvedValueOnce(page2)
        .mockResolvedValueOnce(page2)
        .mockResolvedValue({ ...paginated(mockEsComponents), totalPages: 2 });

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument());
      await user.click(screen.getByRole("button", { name: /Siguiente/ }));
      await waitFor(() => expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 2, 10, ""));

      await user.click(screen.getByRole("button", { name: /Anterior/ }));

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 1, 10, "");
        expect(adminComponentsApi.list).toHaveBeenCalledWith("en", 1, 10, "");
      });
    });
  });

  describe("modal creación", () => {
    it("al hacer clic en 'Nuevo componente' abre el modal", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Nuevo componente")).toBeInTheDocument());

      await user.click(screen.getByText("Nuevo componente"));

      expect(screen.getByTestId("component-modal")).toBeInTheDocument();
    });
  });

  describe("buscador", () => {
    it("muestra el input de búsqueda con el placeholder correcto", async () => {
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Buscar por nombre o SKU...")).toBeInTheDocument();
      });
    });

    it("el input de búsqueda es visible durante la carga", () => {
      vi.mocked(adminComponentsApi.list).mockImplementation(() => new Promise(() => {}));

      render(<ComponentsContent />);

      expect(screen.getByPlaceholderText("Buscar por nombre o SKU...")).toBeInTheDocument();
    });

    it("al escribir llama a la API en ambos locales con el término de búsqueda", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      await user.type(screen.getByPlaceholderText("Buscar por nombre o SKU..."), "WHEEL");

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledWith("es", 1, 10, "WHEEL");
        expect(adminComponentsApi.list).toHaveBeenCalledWith("en", 1, 10, "WHEEL");
      });
    });

    it("el botón limpiar aparece al escribir en el input", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "WHEEL");

      expect(within(input.closest("div") as HTMLElement).getByRole("button")).toBeInTheDocument();
    });

    it("al hacer clic en el botón limpiar se vacía el input", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "WHEEL");

      const clearButton = within(input.closest("div") as HTMLElement).getByRole("button");
      await user.click(clearButton);

      expect(input).toHaveValue("");
    });

    it("muestra mensaje dinámico cuando la búsqueda no devuelve resultados", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      await user.type(screen.getByPlaceholderText("Buscar por nombre o SKU..."), "xyz");

      await waitFor(() => {
        expect(screen.getByText('No se encontraron resultados para "xyz"')).toBeInTheDocument();
      });
    });

    it("al limpiar la búsqueda vuelve al mensaje de empty state estándar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue(emptyPaginated);

      render(<ComponentsContent />);
      await waitFor(() => screen.getByPlaceholderText("Buscar por nombre o SKU..."));

      const input = screen.getByPlaceholderText("Buscar por nombre o SKU...");
      await user.type(input, "xyz");
      await waitFor(() => screen.getByText('No se encontraron resultados para "xyz"'));

      const clearButton = within(input.closest("div") as HTMLElement).getByRole("button");
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("No hay componentes creados")).toBeInTheDocument();
      });
    });
  });
});
