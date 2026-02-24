import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { CategoryListItem } from "@/types/categories";

vi.mock("@/lib/api/admin-categories", () => ({
  adminCategoriesApi: {
    create: vi.fn(),
    update: vi.fn(),
    updateTranslations: vi.fn(),
    getCategoryBothLocales: vi.fn(),
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

import CategoryModal from "@/components/admin/categories/CategoryModal";
import { adminCategoriesApi } from "@/lib/api/admin-categories";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

const mockEditItem: CategoryListItem = {
  id: "cat-1",
  name: "Volantes",
  slug: "volantes",
  isActive: true,
  shortDescription: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockBothLocales = {
  es: {
    id: "cat-1",
    name: "Volantes",
    slug: "volantes",
    isActive: true,
    shortDescription: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  en: {
    id: "cat-1",
    name: "Steering Wheels",
    slug: "steering-wheels",
    isActive: true,
    shortDescription: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
};

describe("CategoryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("visibilidad", () => {
    it("no renderiza nada cuando isOpen es false", () => {
      const { container } = render(
        <CategoryModal {...defaultProps} isOpen={false} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renderiza el modal cuando isOpen es true", () => {
      render(<CategoryModal {...defaultProps} />);

      expect(screen.getByText("Nueva categoría")).toBeInTheDocument();
    });
  });

  describe("creación", () => {
    it("muestra título 'Nueva categoría'", () => {
      render(<CategoryModal {...defaultProps} />);

      expect(screen.getByText("Nueva categoría")).toBeInTheDocument();
    });

    it("muestra las 3 pestañas: General, Español, English", () => {
      render(<CategoryModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    });

    it("en pestaña General muestra checkbox 'Categoría activa'", () => {
      render(<CategoryModal {...defaultProps} />);

      expect(screen.getByText("Categoría activa")).toBeInTheDocument();
    });

    it("en pestaña Español muestra campos de nombre y slug", async () => {
      const user = userEvent.setup();
      render(<CategoryModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));

      expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    });

    it("en pestaña English muestra campos de nombre y slug", async () => {
      const user = userEvent.setup();
      render(<CategoryModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "English" }));

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    });

    it("el slug se genera automáticamente al escribir el nombre en Español", async () => {
      const user = userEvent.setup();
      render(<CategoryModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volantes");

      const slugInput = screen.getByLabelText(/Slug/i);
      expect((slugInput as HTMLInputElement).value).toBe("volantes");
    });

    it("llama a adminCategoriesApi.create al enviar el formulario", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.create).mockResolvedValue({} as never);

      render(<CategoryModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volantes");

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminCategoriesApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            isActive: true,
            translations: expect.arrayContaining([
              expect.objectContaining({ locale: "es", name: "Volantes", slug: "volantes" }),
            ]),
          }),
        );
      });
    });

    it("llama a onSuccess y onClose tras crear con éxito", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const onClose = vi.fn();
      vi.mocked(adminCategoriesApi.create).mockResolvedValue({} as never);

      render(
        <CategoryModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      );

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volantes");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it("muestra mensaje de error cuando create falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.create).mockRejectedValue(new Error("Error del servidor"));

      render(<CategoryModal {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Español" }));
      await user.type(screen.getByLabelText(/Nombre/i), "Volantes");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(screen.getByText("Error al crear la categoría")).toBeInTheDocument();
      });
    });
  });

  describe("edición", () => {
    it("muestra título 'Editar categoría' cuando hay editItem", async () => {
      vi.mocked(adminCategoriesApi.getCategoryBothLocales).mockResolvedValue(mockBothLocales as never);

      render(<CategoryModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.getByText("Editar categoría")).toBeInTheDocument();
      });
    });

    it("llama a getCategoryBothLocales con el id del item al abrir", async () => {
      vi.mocked(adminCategoriesApi.getCategoryBothLocales).mockResolvedValue(mockBothLocales as never);

      render(<CategoryModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(adminCategoriesApi.getCategoryBothLocales).toHaveBeenCalledWith("cat-1");
      });
    });

    it("precarga los campos con los datos del item al editar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getCategoryBothLocales).mockResolvedValue(mockBothLocales as never);

      render(<CategoryModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.queryByText("Cargando traducciones...")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Español" }));

      const nameInput = screen.getByLabelText(/Nombre/i);
      expect((nameInput as HTMLInputElement).value).toBe("Volantes");
    });

    it("llama a update y updateTranslations al guardar en edición", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getCategoryBothLocales).mockResolvedValue(mockBothLocales as never);
      vi.mocked(adminCategoriesApi.update).mockResolvedValue({} as never);
      vi.mocked(adminCategoriesApi.updateTranslations).mockResolvedValue({} as never);

      render(<CategoryModal {...defaultProps} editItem={mockEditItem} />);

      await waitFor(() => {
        expect(screen.queryByText("Cargando traducciones...")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Guardar" }));

      await waitFor(() => {
        expect(adminCategoriesApi.update).toHaveBeenCalledWith(
          "cat-1",
          expect.objectContaining({ isActive: true }),
        );
        expect(adminCategoriesApi.updateTranslations).toHaveBeenCalledWith(
          "cat-1",
          expect.objectContaining({ translations: expect.any(Array) }),
        );
      });
    });
  });
});
