import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { AdminComponentListItem } from "@/types/admin";

vi.mock("@/lib/api/admin-components", () => ({
  adminComponentsApi: {
    create: vi.fn(),
    update: vi.fn(),
    updateTranslations: vi.fn(),
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

import ComponentModal from "@/components/admin/components/ComponentModal";
import { adminComponentsApi } from "@/lib/api/admin-components";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

const mockEditItem = {
  es: {
    id: "comp-1",
    sku: "WHEEL-BASE-001",
    name: "Base de volante DD Pro",
    componentType: "WheelBase",
    stockQuantity: 10,
    inStock: true,
    weightGrams: 2500,
  } as AdminComponentListItem,
  en: {
    id: "comp-1",
    sku: "WHEEL-BASE-001",
    name: "DD Pro Wheel Base",
    componentType: "WheelBase",
    stockQuantity: 10,
    inStock: true,
    weightGrams: 2500,
  } as AdminComponentListItem,
};

describe("ComponentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("visibilidad", () => {
    it("no renderiza nada cuando isOpen es false", () => {
      const { container } = render(
        <ComponentModal {...defaultProps} isOpen={false} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renderiza el modal cuando isOpen es true", () => {
      render(<ComponentModal {...defaultProps} />);

      expect(screen.getByText("Nuevo componente")).toBeInTheDocument();
    });
  });

  describe("creación", () => {
    it("muestra título 'Nuevo componente'", () => {
      render(<ComponentModal {...defaultProps} />);

      expect(screen.getByText("Nuevo componente")).toBeInTheDocument();
    });

    it("muestra las 3 pestañas: General, Español, English", () => {
      render(<ComponentModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    });

    it("en pestaña General muestra campos SKU y Tipo de componente", () => {
      render(<ComponentModal {...defaultProps} />);

      expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tipo de componente/i)).toBeInTheDocument();
    });

    it("en pestaña General muestra campo Stock", () => {
      render(<ComponentModal {...defaultProps} />);

      expect(screen.getByLabelText(/Stock \*/i)).toBeInTheDocument();
    });

    it("en pestaña Español muestra campo de nombre", async () => {
      const user = userEvent.setup();
      render(<ComponentModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));

      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    });

    it("en pestaña English muestra campo de nombre", async () => {
      const user = userEvent.setup();
      render(<ComponentModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "English" }));

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    it("llama a adminComponentsApi.create al enviar el formulario", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.create).mockResolvedValue({} as never);

      render(<ComponentModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/SKU/i), "WHEEL-BASE-001");
      await user.type(screen.getByLabelText(/Tipo de componente/i), "WheelBase");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminComponentsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            sku: "WHEEL-BASE-001",
            componentType: "WheelBase",
          }),
        );
      });
    });

    it("llama a onSuccess y onClose tras crear con éxito", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const onClose = vi.fn();
      vi.mocked(adminComponentsApi.create).mockResolvedValue({} as never);

      render(
        <ComponentModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      );

      await user.type(screen.getByLabelText(/SKU/i), "X");
      await user.type(screen.getByLabelText(/Tipo de componente/i), "WheelBase");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("muestra mensaje de error cuando create falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.create).mockRejectedValue(new Error("Error del servidor"));

      render(<ComponentModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/SKU/i), "X");
      await user.type(screen.getByLabelText(/Tipo de componente/i), "WheelBase");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(screen.getByText("Error al crear el componente")).toBeInTheDocument();
      });
    });
  });

  describe("edición", () => {
    it("muestra título 'Editar componente' cuando hay editItem", () => {
      render(<ComponentModal {...defaultProps} editItem={mockEditItem} />);

      expect(screen.getByText("Editar componente")).toBeInTheDocument();
    });

    it("precarga el SKU del componente (deshabilitado)", () => {
      render(<ComponentModal {...defaultProps} editItem={mockEditItem} />);

      const skuInput = screen.getByLabelText(/SKU/i) as HTMLInputElement;
      expect(skuInput.value).toBe("WHEEL-BASE-001");
      expect(skuInput.disabled).toBe(true);
    });

    it("precarga el nombre en español", async () => {
      const user = userEvent.setup();
      render(<ComponentModal {...defaultProps} editItem={mockEditItem} />);

      await user.click(screen.getByRole("button", { name: "Español" }));

      const nameInput = screen.getByLabelText(/Nombre/i) as HTMLInputElement;
      expect(nameInput.value).toBe("Base de volante DD Pro");
    });

    it("llama a update y updateTranslations al guardar en edición", async () => {
      const user = userEvent.setup();
      vi.mocked(adminComponentsApi.update).mockResolvedValue({} as never);
      vi.mocked(adminComponentsApi.updateTranslations).mockResolvedValue({} as never);

      render(<ComponentModal {...defaultProps} editItem={mockEditItem} />);

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminComponentsApi.update).toHaveBeenCalledWith(
          "comp-1",
          expect.objectContaining({ componentType: "WheelBase" }),
        );
        expect(adminComponentsApi.updateTranslations).toHaveBeenCalledWith(
          "comp-1",
          expect.objectContaining({ translations: expect.any(Array) }),
        );
      });
    });
  });
});
