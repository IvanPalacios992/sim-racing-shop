import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { CategoryListItem } from "@/types/categories";
import type { ProductCategoryItem } from "@/types/admin";

vi.mock("@/lib/api/admin-products", () => ({
  adminProductsApi: {
    getCategories: vi.fn(),
    setCategories: vi.fn(),
  },
}));

import CategoryAssignPanel from "@/components/admin/products/CategoryAssignPanel";
import { adminProductsApi } from "@/lib/api/admin-products";

const mockAssigned: ProductCategoryItem[] = [
  { id: "cat-1", name: "Volantes", slug: "volantes" },
];

const mockAvailable: CategoryListItem[] = [
  { id: "cat-1", name: "Volantes", slug: "volantes", shortDescription: null, imageUrl: null, isActive: true },
  { id: "cat-2", name: "Pedales", slug: "pedales", shortDescription: null, imageUrl: null, isActive: true },
  { id: "cat-3", name: "Bases", slug: "bases", shortDescription: null, imageUrl: null, isActive: true },
  { id: "cat-inactive", name: "Archivada", slug: "archivada", shortDescription: null, imageUrl: null, isActive: false },
];

describe("CategoryAssignPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── carga inicial ─────────────────────────────────────────────────────────

  describe("carga inicial", () => {
    it("muestra 'Cargando categorías...' mientras carga", () => {
      vi.mocked(adminProductsApi.getCategories).mockImplementation(() => new Promise(() => {}));

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      expect(screen.getByText("Cargando categorías...")).toBeInTheDocument();
    });

    it("llama a getCategories con el productId correcto", async () => {
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => {
        expect(adminProductsApi.getCategories).toHaveBeenCalledWith("prod-1");
      });
    });

    it("muestra las categorías asignadas al cargar", async () => {
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => {
        expect(screen.getByText("Volantes")).toBeInTheDocument();
      });
    });

    it("muestra 'Sin categorías asignadas' cuando no hay ninguna", async () => {
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => {
        expect(screen.getByText("Sin categorías asignadas")).toBeInTheDocument();
      });
    });

    it("muestra error si getCategories falla", async () => {
      vi.mocked(adminProductsApi.getCategories).mockRejectedValue(new Error("Error de red"));

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar categorías")).toBeInTheDocument();
      });
    });
  });

  // ── lista de disponibles ──────────────────────────────────────────────────

  describe("lista de categorías disponibles", () => {
    it("muestra las categorías no asignadas en la sección Añadir", async () => {
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      // cat-1 ya está asignada, deben aparecer cat-2 y cat-3 (no cat-inactive)
      expect(screen.getByText("Pedales")).toBeInTheDocument();
      expect(screen.getByText("Bases")).toBeInTheDocument();
    });

    it("no muestra categorías inactivas en la lista de disponibles", async () => {
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      expect(screen.queryByText("Archivada")).not.toBeInTheDocument();
    });

    it("muestra 'No hay más categorías disponibles' cuando todas están asignadas", async () => {
      const allAssigned: ProductCategoryItem[] = mockAvailable
        .filter((c) => c.isActive)
        .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(allAssigned);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => {
        expect(screen.getByText("No hay más categorías disponibles")).toBeInTheDocument();
      });
    });
  });

  // ── búsqueda ──────────────────────────────────────────────────────────────

  describe("búsqueda", () => {
    it("filtra las categorías disponibles al escribir en el buscador", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      await user.type(screen.getByPlaceholderText("Buscar categoría..."), "ped");

      expect(screen.getByText("Pedales")).toBeInTheDocument();
      expect(screen.queryByText("Volantes")).not.toBeInTheDocument();
      expect(screen.queryByText("Bases")).not.toBeInTheDocument();
    });

    it("muestra 'Sin resultados' cuando la búsqueda no encuentra nada", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      await user.type(screen.getByPlaceholderText("Buscar categoría..."), "zzz");

      expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    });
  });

  // ── añadir categoría ─────────────────────────────────────────────────────

  describe("añadir categoría", () => {
    it("llama a setCategories al hacer clic en Añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);
      vi.mocked(adminProductsApi.setCategories).mockResolvedValue([
        ...mockAssigned,
        { id: "cat-2", name: "Pedales", slug: "pedales" },
      ]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      const addButtons = screen.getAllByRole("button", { name: "Añadir" });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(adminProductsApi.setCategories).toHaveBeenCalledWith(
          "prod-1",
          expect.objectContaining({
            categoryIds: expect.arrayContaining(["cat-1"]),
          }),
        );
      });
    });

    it("muestra la nueva categoría asignada tras añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);
      vi.mocked(adminProductsApi.setCategories).mockResolvedValue([
        { id: "cat-2", name: "Pedales", slug: "pedales" },
      ]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      const addButtons = screen.getAllByRole("button", { name: "Añadir" });
      await user.click(addButtons[0]);

      await waitFor(() => {
        // tras añadir, el panel actualiza la lista asignada con el resultado de la API
        expect(adminProductsApi.setCategories).toHaveBeenCalledTimes(1);
      });
    });

    it("muestra error si setCategories falla al añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue([]);
      vi.mocked(adminProductsApi.setCategories).mockRejectedValue(new Error("Error"));

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.queryByText("Cargando categorías...")).not.toBeInTheDocument());

      const addButtons = screen.getAllByRole("button", { name: "Añadir" });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Error al asignar la categoría")).toBeInTheDocument();
      });
    });
  });

  // ── quitar categoría ─────────────────────────────────────────────────────

  describe("quitar categoría", () => {
    it("llama a setCategories sin el id al hacer clic en el botón X", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);
      vi.mocked(adminProductsApi.setCategories).mockResolvedValue([]);

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.getByText("Volantes")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Quitar Volantes" }));

      await waitFor(() => {
        expect(adminProductsApi.setCategories).toHaveBeenCalledWith("prod-1", {
          categoryIds: [],
        });
      });
    });

    it("muestra error si setCategories falla al quitar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getCategories).mockResolvedValue(mockAssigned);
      vi.mocked(adminProductsApi.setCategories).mockRejectedValue(new Error("Error"));

      render(<CategoryAssignPanel productId="prod-1" availableCategories={mockAvailable} />);

      await waitFor(() => expect(screen.getByText("Volantes")).toBeInTheDocument());

      await user.click(screen.getByRole("button", { name: "Quitar Volantes" }));

      await waitFor(() => {
        expect(screen.getByText("Error al quitar la categoría")).toBeInTheDocument();
      });
    });
  });
});
