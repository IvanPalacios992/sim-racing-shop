import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../../helpers/auth-store";
import type { CategoryListItem } from "@/types/categories";

vi.mock("@/lib/api/admin-categories", () => ({
  adminCategoriesApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/components/admin/categories/CategoryModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen
      ? React.createElement("div", { "data-testid": "category-modal" }, "CategoryModal")
      : null,
}));

import CategoriesContent from "@/components/admin/categories/CategoriesContent";
import { adminCategoriesApi } from "@/lib/api/admin-categories";

const mockCategories: CategoryListItem[] = [
  {
    id: "cat-1",
    name: "Volantes",
    slug: "volantes",
    isActive: true,
    shortDescription: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Pedales",
    slug: "pedales",
    isActive: false,
    shortDescription: null,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

const emptyPaginated = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };
const paginated = (items: CategoryListItem[]) => ({
  items,
  totalCount: items.length,
  page: 1,
  pageSize: 10,
  totalPages: items.length > 0 ? 1 : 0,
});

describe("CategoriesContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
    useAuthStore.getState().setAuth(createMockAuthResponse());
    useAuthStore.setState({ _hasHydrated: true });
  });

  describe("loading", () => {
    it("muestra skeleton mientras carga", () => {
      vi.mocked(adminCategoriesApi.list).mockImplementation(() => new Promise(() => {}));

      render(<CategoriesContent />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("no llama a la API hasta que el store está hidratado", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<CategoriesContent />);

      expect(adminCategoriesApi.list).not.toHaveBeenCalled();
    });

    it("llama a list con locale 'es'", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(emptyPaginated);

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(adminCategoriesApi.list).toHaveBeenCalledWith("es", 1, 10);
      });
    });
  });

  describe("error", () => {
    it("muestra mensaje de error cuando la API falla", async () => {
      vi.mocked(adminCategoriesApi.list).mockRejectedValue(new Error("Network error"));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar categorías")).toBeInTheDocument();
      });
    });

    it("muestra botón Reintentar al fallar", async () => {
      vi.mocked(adminCategoriesApi.list).mockRejectedValue(new Error("Network error"));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });

    it("vuelve a cargar al hacer clic en Reintentar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.list)
        .mockRejectedValueOnce(new Error("error"))
        .mockResolvedValueOnce(emptyPaginated);

      render(<CategoriesContent />);

      await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
      await user.click(screen.getByText("Reintentar"));

      await waitFor(() => {
        expect(adminCategoriesApi.list).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("empty state", () => {
    it("muestra mensaje cuando no hay categorías", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(emptyPaginated);

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("No hay categorías creadas")).toBeInTheDocument();
      });
    });
  });

  describe("tabla", () => {
    it("renderiza el título de la página", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Categorías")).toBeInTheDocument();
      });
    });

    it("renderiza las cabeceras de columna", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Nombre")).toBeInTheDocument();
        expect(screen.getByText("Slug")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
      });
    });

    it("renderiza los nombres de las categorías", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Volantes")).toBeInTheDocument();
        expect(screen.getByText("Pedales")).toBeInTheDocument();
      });
    });

    it("muestra badge 'Activa' para categorías activas", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Activa")).toBeInTheDocument();
      });
    });

    it("muestra badge 'Inactiva' para categorías inactivas", async () => {
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => {
        expect(screen.getByText("Inactiva")).toBeInTheDocument();
      });
    });
  });

  describe("eliminar", () => {
    it("al hacer clic en eliminar muestra confirmación inline", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => expect(screen.getByText("Volantes")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sí" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    });

    it("al hacer clic en No oculta la confirmación", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));

      render(<CategoriesContent />);

      await waitFor(() => expect(screen.getByText("Volantes")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "No" }));

      expect(screen.queryByText("¿Eliminar?")).not.toBeInTheDocument();
    });

    it("al confirmar llama a delete con el id correcto", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(paginated(mockCategories));
      vi.mocked(adminCategoriesApi.delete).mockResolvedValue(undefined);

      render(<CategoriesContent />);

      await waitFor(() => expect(screen.getByText("Volantes")).toBeInTheDocument());

      const deleteButtons = screen.getAllByTitle("Eliminar");
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminCategoriesApi.delete).toHaveBeenCalledWith("cat-1");
      });
    });
  });

  describe("modal creación", () => {
    it("al hacer clic en 'Nueva categoría' abre el modal", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.list).mockResolvedValue(emptyPaginated);

      render(<CategoriesContent />);

      await waitFor(() => expect(screen.getByText("Nueva categoría")).toBeInTheDocument());

      await user.click(screen.getByText("Nueva categoría"));

      expect(screen.getByTestId("category-modal")).toBeInTheDocument();
    });
  });
});
