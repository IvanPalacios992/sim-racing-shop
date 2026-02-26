import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { AdminCategoryImageItem } from "@/types/admin";

vi.mock("@/lib/api/admin-categories", () => ({
  adminCategoriesApi: {
    getImage: vi.fn(),
    setImage: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

import CategoryImagePanel from "@/components/admin/categories/CategoryImagePanel";
import { adminCategoriesApi } from "@/lib/api/admin-categories";

const mockImage: AdminCategoryImageItem = {
  id: "img-1",
  imageUrl: "https://example.com/cat.jpg",
  altText: "Imagen de categoría",
};

describe("CategoryImagePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── carga inicial ─────────────────────────────────────────────────────────

  describe("carga inicial", () => {
    it("muestra 'Cargando imagen...' mientras carga", () => {
      vi.mocked(adminCategoriesApi.getImage).mockImplementation(() => new Promise(() => {}));

      render(<CategoryImagePanel categoryId="cat-1" />);

      expect(screen.getByText("Cargando imagen...")).toBeInTheDocument();
    });

    it("llama a getImage con el categoryId correcto", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => {
        expect(adminCategoriesApi.getImage).toHaveBeenCalledWith("cat-1");
      });
    });

    it("muestra la URL de la imagen actual al cargar", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => {
        expect(screen.getByText("https://example.com/cat.jpg")).toBeInTheDocument();
      });
    });

    it("muestra el alt text cuando está presente", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => {
        expect(screen.getByText("Imagen de categoría")).toBeInTheDocument();
      });
    });

    it("muestra 'Sin imagen asignada' cuando no hay imagen", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => {
        expect(screen.getByText("Sin imagen asignada")).toBeInTheDocument();
      });
    });

    it("muestra error si getImage falla", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockRejectedValue(new Error("Error de red"));

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar la imagen")).toBeInTheDocument();
      });
    });
  });

  // ── establecer imagen ─────────────────────────────────────────────────────

  describe("establecer imagen", () => {
    it("muestra 'Añadir imagen por URL' cuando no hay imagen", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      expect(screen.getByText("Añadir imagen por URL")).toBeInTheDocument();
    });

    it("muestra el botón 'Reemplazar imagen' cuando ya hay imagen", async () => {
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);

      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      expect(screen.getByRole("button", { name: "Reemplazar imagen" })).toBeInTheDocument();
    });

    it("llama a setImage al enviar el formulario con URL y alt text", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);
      vi.mocked(adminCategoriesApi.setImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: "Nueva imagen",
      });

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.type(screen.getByLabelText(/Texto alternativo/i), "Nueva imagen");
      await user.click(screen.getByRole("button", { name: "Guardar imagen" }));

      await waitFor(() => {
        expect(adminCategoriesApi.setImage).toHaveBeenCalledWith(
          "cat-1",
          expect.objectContaining({
            imageUrl: "https://example.com/new.jpg",
            altText: "Nueva imagen",
          }),
        );
      });
    });

    it("muestra la imagen guardada tras establecerla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);
      vi.mocked(adminCategoriesApi.setImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: null,
      });

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Guardar imagen" }));

      await waitFor(() => {
        expect(screen.getByText("https://example.com/new.jpg")).toBeInTheDocument();
      });
    });

    it("limpia el formulario tras guardar con éxito", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);
      vi.mocked(adminCategoriesApi.setImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: null,
      });

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      const urlInput = screen.getByLabelText(/URL de la imagen/i) as HTMLInputElement;
      await user.type(urlInput, "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Guardar imagen" }));

      await waitFor(() => {
        expect(urlInput.value).toBe("");
      });
    });

    it("muestra error si setImage falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(null);
      vi.mocked(adminCategoriesApi.setImage).mockRejectedValue(new Error("Error de red"));

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Guardar imagen" }));

      await waitFor(() => {
        expect(screen.getByText("Error al guardar la imagen")).toBeInTheDocument();
      });
    });
  });

  // ── eliminar imagen ───────────────────────────────────────────────────────

  describe("eliminar imagen", () => {
    it("muestra confirmación al hacer clic en el botón eliminar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sí" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    });

    it("llama a deleteImage al confirmar con Sí", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);
      vi.mocked(adminCategoriesApi.deleteImage).mockResolvedValue(undefined as never);

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminCategoriesApi.deleteImage).toHaveBeenCalledWith("cat-1");
      });
    });

    it("muestra 'Sin imagen asignada' tras eliminar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);
      vi.mocked(adminCategoriesApi.deleteImage).mockResolvedValue(undefined as never);

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.getByText("https://example.com/cat.jpg")).toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(screen.getByText("Sin imagen asignada")).toBeInTheDocument();
      });
    });

    it("cancela la eliminación al hacer clic en No", async () => {
      const user = userEvent.setup();
      vi.mocked(adminCategoriesApi.getImage).mockResolvedValue(mockImage);

      render(<CategoryImagePanel categoryId="cat-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imagen...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "No" }));

      expect(screen.queryByText("¿Eliminar?")).not.toBeInTheDocument();
      expect(adminCategoriesApi.deleteImage).not.toHaveBeenCalled();
    });
  });
});
