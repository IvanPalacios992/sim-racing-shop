import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { AdminComponentListItem, ProductComponentOptionAdminDto } from "@/types/admin";

vi.mock("@/lib/api/admin-products", () => ({
  adminProductsApi: {
    getComponentOptions: vi.fn(),
    addComponentOption: vi.fn(),
    updateComponentOption: vi.fn(),
    deleteComponentOption: vi.fn(),
  },
}));

import ComponentOptionsPanel from "@/components/admin/products/ComponentOptionsPanel";
import { adminProductsApi } from "@/lib/api/admin-products";

const availableComponents: AdminComponentListItem[] = [
  {
    id: "comp-1",
    sku: "WHEEL-BASE-001",
    name: "Base de volante DD Pro",
    componentType: "WheelBase",
    stockQuantity: 10,
    inStock: true,
    weightGrams: null,
  },
  {
    id: "comp-2",
    sku: "PEDALS-001",
    name: "Pedales Sprint",
    componentType: "Pedals",
    stockQuantity: 5,
    inStock: true,
    weightGrams: null,
  },
];

const mockOptions: ProductComponentOptionAdminDto[] = [
  {
    id: "opt-1",
    componentId: "comp-1",
    componentSku: "WHEEL-BASE-001",
    optionGroup: "Volante",
    isGroupRequired: true,
    glbObjectName: "Rim_Mesh",
    thumbnailUrl: null,
    priceModifier: 0,
    isDefault: true,
    displayOrder: 0,
  },
];

const defaultProps = {
  productId: "prod-1",
  availableComponents,
};

describe("ComponentOptionsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading", () => {
    it("muestra 'Cargando opciones...' mientras carga", () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockImplementation(
        () => new Promise(() => {}),
      );

      render(<ComponentOptionsPanel {...defaultProps} />);

      expect(screen.getByText("Cargando opciones...")).toBeInTheDocument();
    });

    it("llama a getComponentOptions con el productId", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(adminProductsApi.getComponentOptions).toHaveBeenCalledWith("prod-1");
      });
    });
  });

  describe("error", () => {
    it("muestra mensaje de error cuando falla la carga", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockRejectedValue(
        new Error("Network error"),
      );

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar opciones de componentes"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("muestra mensaje cuando no hay opciones configuradas", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("No hay opciones de componentes configuradas"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("tabla de opciones", () => {
    it("renderiza las cabeceras de la tabla", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Componente")).toBeInTheDocument();
        expect(screen.getByText("Grupo")).toBeInTheDocument();
        expect(screen.getByText("Objeto GLB")).toBeInTheDocument();
        expect(screen.getByText("Precio mod.")).toBeInTheDocument();
        expect(screen.getByText("Por defecto")).toBeInTheDocument();
        expect(screen.getByText("Orden")).toBeInTheDocument();
      });
    });

    it("renderiza el SKU del componente", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("WHEEL-BASE-001")).toBeInTheDocument();
      });
    });

    it("renderiza el grupo de la opción", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Volante")).toBeInTheDocument();
      });
    });

    it("muestra 'Sí' en la columna Por defecto cuando isDefault es true", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Sí")).toBeInTheDocument();
      });
    });
  });

  describe("añadir opción", () => {
    it("muestra botón 'Añadir componente'", async () => {
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Añadir componente")).toBeInTheDocument();
      });
    });

    it("al hacer clic en 'Añadir componente' muestra el formulario", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());

      await user.click(screen.getByText("Añadir componente"));

      expect(screen.getByText("Añadir opción de componente")).toBeInTheDocument();
    });

    it("llama a addComponentOption al guardar una nueva opción", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);
      vi.mocked(adminProductsApi.addComponentOption).mockResolvedValue(mockOptions[0]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());

      await user.click(screen.getByText("Añadir componente"));

      // Select a component from the listbox (select size={6} has role="listbox")
      const select = screen.getByRole("listbox");
      await user.selectOptions(select, "comp-1");

      // Fill in group (use exact label to avoid matching "Grupo requerido")
      await user.type(screen.getByLabelText("Grupo *"), "Volante");

      await user.click(screen.getByRole("button", { name: "Guardar opción" }));

      await waitFor(() => {
        expect(adminProductsApi.addComponentOption).toHaveBeenCalledWith(
          "prod-1",
          expect.objectContaining({
            componentId: "comp-1",
            optionGroup: "Volante",
          }),
        );
      });
    });

    it("al cancelar el formulario oculta el formulario", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());

      await user.click(screen.getByText("Añadir componente"));

      expect(screen.getByText("Añadir opción de componente")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByText("Añadir opción de componente")).not.toBeInTheDocument();
    });
  });

  describe("búsqueda de componentes", () => {
    it("muestra todos los componentes cuando el campo de búsqueda está vacío", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));

      const select = screen.getByRole("listbox");
      expect(select).toContainElement(screen.getByText(/WHEEL-BASE-001/));
      expect(select).toContainElement(screen.getByText(/PEDALS-001/));
    });

    it("filtra los componentes al escribir en el campo de búsqueda", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));

      await user.type(screen.getByPlaceholderText("Buscar por SKU o nombre..."), "PEDALS");

      const select = screen.getByRole("listbox");
      expect(select).toContainElement(screen.getByText(/PEDALS-001/));
      expect(select).not.toContainElement(screen.queryByText(/WHEEL-BASE-001/));
    });

    it("filtra por nombre además de por SKU", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));

      await user.type(screen.getByPlaceholderText("Buscar por SKU o nombre..."), "Sprint");

      const select = screen.getByRole("listbox");
      expect(select).toContainElement(screen.getByText(/PEDALS-001/));
      expect(select).not.toContainElement(screen.queryByText(/WHEEL-BASE-001/));
    });

    it("muestra el contador de resultados cuando hay búsqueda activa", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));

      await user.type(screen.getByPlaceholderText("Buscar por SKU o nombre..."), "PEDALS");

      expect(screen.getByText("1 resultado(s)")).toBeInTheDocument();
    });

    it("no muestra el contador cuando el campo de búsqueda está vacío", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));

      expect(screen.queryByText(/resultado/)).not.toBeInTheDocument();
    });

    it("resetea la búsqueda al abrir el formulario de añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue([]);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("Añadir componente")).toBeInTheDocument());
      await user.click(screen.getByText("Añadir componente"));
      await user.type(screen.getByPlaceholderText("Buscar por SKU o nombre..."), "PEDALS");
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      await user.click(screen.getByText("Añadir componente"));

      expect(screen.getByPlaceholderText("Buscar por SKU o nombre...")).toHaveValue("");
    });
  });

  describe("eliminar opción", () => {
    it("al hacer clic en eliminar muestra confirmación ¿Borrar?", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("WHEEL-BASE-001")).toBeInTheDocument());

      // Los botones de acción no tienen title: orden → [0]=editar, [1]=borrar, [2]=Añadir componente
      const allButtons = screen.getAllByRole("button");
      const deleteButton = allButtons[1]; // botón trash
      await user.click(deleteButton);

      expect(screen.getByText("¿Borrar?")).toBeInTheDocument();
    });

    it("al confirmar eliminar llama a deleteComponentOption", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getComponentOptions).mockResolvedValue(mockOptions);
      vi.mocked(adminProductsApi.deleteComponentOption).mockResolvedValue(undefined);

      render(<ComponentOptionsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText("WHEEL-BASE-001")).toBeInTheDocument());

      const allButtons = screen.getAllByRole("button");
      const deleteButton = allButtons[1]; // botón trash
      await user.click(deleteButton);
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminProductsApi.deleteComponentOption).toHaveBeenCalledWith("prod-1", "opt-1");
      });
    });
  });
});
