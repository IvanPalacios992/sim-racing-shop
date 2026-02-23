import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
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
      vi.mocked(adminComponentsApi.list).mockResolvedValue([]);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(adminComponentsApi.list).toHaveBeenCalledTimes(2);
        expect(adminComponentsApi.list).toHaveBeenCalledWith("es");
        expect(adminComponentsApi.list).toHaveBeenCalledWith("en");
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
        .mockResolvedValue([]);

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
      vi.mocked(adminComponentsApi.list).mockResolvedValue([]);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("No hay componentes creados")).toBeInTheDocument();
      });
    });
  });

  describe("tabla", () => {
    it("renderiza el título de la página", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Componentes")).toBeInTheDocument();
      });
    });

    it("renderiza las cabeceras de columna", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

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
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument();
        expect(screen.getByText("Pedales Sprint")).toBeInTheDocument();
      });
    });

    it("muestra 'En stock' para componentes con stock", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

      render(<ComponentsContent />);

      await waitFor(() => {
        expect(screen.getByText(/En stock/)).toBeInTheDocument();
      });
    });

    it("muestra 'Agotado' para componentes sin stock", async () => {
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

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
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Base de volante DD Pro")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
    });

    it("al confirmar llama a delete con el id correcto", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list)
        .mockResolvedValueOnce(mockEsComponents)
        .mockResolvedValueOnce(mockEnComponents);
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

  describe("modal creación", () => {
    it("al hacer clic en 'Nuevo componente' abre el modal", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.list).mockResolvedValue([]);

      render(<ComponentsContent />);

      await waitFor(() => expect(screen.getByText("Nuevo componente")).toBeInTheDocument());

      await user.click(screen.getByText("Nuevo componente"));

      expect(screen.getByTestId("component-modal")).toBeInTheDocument();
    });
  });
});
