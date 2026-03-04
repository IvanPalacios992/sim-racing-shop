import React from "react";
import { render, screen, waitFor } from "../../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { AdminProductImageItem } from "@/types/admin";

vi.mock("@/lib/api/admin-products", () => ({
  adminProductsApi: {
    getImages: vi.fn(),
    addImage: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

import ProductImagesPanel from "@/components/admin/products/ProductImagesPanel";
import { adminProductsApi } from "@/lib/api/admin-products";

const mockImages: AdminProductImageItem[] = [
  { id: "img-1", imageUrl: "https://example.com/img1.jpg", altText: "Primera imagen", displayOrder: 0 },
  { id: "img-2", imageUrl: "https://example.com/img2.jpg", altText: null, displayOrder: 1 },
];

describe("ProductImagesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── carga inicial ─────────────────────────────────────────────────────────

  describe("carga inicial", () => {
    it("muestra 'Cargando imágenes...' mientras carga", () => {
      vi.mocked(adminProductsApi.getImages).mockImplementation(() => new Promise(() => {}));

      render(<ProductImagesPanel productId="prod-1" />);

      expect(screen.getByText("Cargando imágenes...")).toBeInTheDocument();
    });

    it("llama a getImages con el productId correcto", async () => {
      vi.mocked(adminProductsApi.getImages).mockResolvedValue(mockImages);

      render(<ProductImagesPanel productId="prod-1" />);

      await waitFor(() => {
        expect(adminProductsApi.getImages).toHaveBeenCalledWith("prod-1");
      });
    });

    it("muestra las URLs de las imágenes al cargar", async () => {
      vi.mocked(adminProductsApi.getImages).mockResolvedValue(mockImages);

      render(<ProductImagesPanel productId="prod-1" />);

      await waitFor(() => {
        expect(screen.getByText("https://example.com/img1.jpg")).toBeInTheDocument();
        expect(screen.getByText("https://example.com/img2.jpg")).toBeInTheDocument();
      });
    });

    it("muestra el alt text cuando está presente", async () => {
      vi.mocked(adminProductsApi.getImages).mockResolvedValue(mockImages);

      render(<ProductImagesPanel productId="prod-1" />);

      await waitFor(() => {
        expect(screen.getByText("Primera imagen")).toBeInTheDocument();
      });
    });

    it("muestra 'Sin imágenes' cuando no hay ninguna", async () => {
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([]);

      render(<ProductImagesPanel productId="prod-1" />);

      await waitFor(() => {
        expect(screen.getByText("Sin imágenes")).toBeInTheDocument();
      });
    });

    it("muestra error si getImages falla", async () => {
      vi.mocked(adminProductsApi.getImages).mockRejectedValue(new Error("Error de red"));

      render(<ProductImagesPanel productId="prod-1" />);

      await waitFor(() => {
        expect(screen.getByText("Error al cargar imágenes")).toBeInTheDocument();
      });
    });
  });

  // ── añadir imagen ─────────────────────────────────────────────────────────

  describe("añadir imagen", () => {
    it("llama a addImage con la URL introducida", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([]);
      vi.mocked(adminProductsApi.addImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: "Nueva imagen",
        displayOrder: 0,
      });

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.type(screen.getByLabelText(/Texto alternativo/i), "Nueva imagen");
      await user.click(screen.getByRole("button", { name: "Añadir imagen" }));

      await waitFor(() => {
        expect(adminProductsApi.addImage).toHaveBeenCalledWith(
          "prod-1",
          expect.objectContaining({
            imageUrl: "https://example.com/new.jpg",
            altText: "Nueva imagen",
            displayOrder: 0,
          }),
        );
      });
    });

    it("muestra la nueva imagen en la lista tras añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([]);
      vi.mocked(adminProductsApi.addImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: null,
        displayOrder: 0,
      });

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Añadir imagen" }));

      await waitFor(() => {
        expect(screen.getByText("https://example.com/new.jpg")).toBeInTheDocument();
      });
    });

    it("limpia el formulario tras añadir con éxito", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([]);
      vi.mocked(adminProductsApi.addImage).mockResolvedValue({
        id: "img-new",
        imageUrl: "https://example.com/new.jpg",
        altText: null,
        displayOrder: 0,
      });

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      const urlInput = screen.getByLabelText(/URL de la imagen/i) as HTMLInputElement;
      await user.type(urlInput, "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Añadir imagen" }));

      await waitFor(() => {
        expect(urlInput.value).toBe("");
      });
    });

    it("muestra error si addImage falla", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([]);
      vi.mocked(adminProductsApi.addImage).mockRejectedValue(new Error("Error de red"));

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/new.jpg");
      await user.click(screen.getByRole("button", { name: "Añadir imagen" }));

      await waitFor(() => {
        expect(screen.getByText("Error al añadir la imagen")).toBeInTheDocument();
      });
    });

    it("usa images.length como displayOrder al añadir", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue(mockImages);
      vi.mocked(adminProductsApi.addImage).mockResolvedValue({
        id: "img-3",
        imageUrl: "https://example.com/img3.jpg",
        altText: null,
        displayOrder: 2,
      });

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.type(screen.getByLabelText(/URL de la imagen/i), "https://example.com/img3.jpg");
      await user.click(screen.getByRole("button", { name: "Añadir imagen" }));

      await waitFor(() => {
        expect(adminProductsApi.addImage).toHaveBeenCalledWith(
          "prod-1",
          expect.objectContaining({ displayOrder: 2 }),
        );
      });
    });
  });

  // ── eliminar imagen ───────────────────────────────────────────────────────

  describe("eliminar imagen", () => {
    it("muestra confirmación al hacer clic en el botón eliminar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([mockImages[0]]);

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));

      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sí" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    });

    it("llama a deleteImage al confirmar con Sí", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([mockImages[0]]);
      vi.mocked(adminProductsApi.deleteImage).mockResolvedValue(undefined as never);

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(adminProductsApi.deleteImage).toHaveBeenCalledWith("prod-1", "img-1");
      });
    });

    it("elimina la imagen de la lista tras confirmar", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([mockImages[0]]);
      vi.mocked(adminProductsApi.deleteImage).mockResolvedValue(undefined as never);

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.getByText("https://example.com/img1.jpg")).toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      await user.click(screen.getByRole("button", { name: "Sí" }));

      await waitFor(() => {
        expect(screen.queryByText("https://example.com/img1.jpg")).not.toBeInTheDocument();
      });
    });

    it("cancela la eliminación al hacer clic en No", async () => {
      const user = userEvent.setup();
      vi.mocked(adminProductsApi.getImages).mockResolvedValue([mockImages[0]]);

      render(<ProductImagesPanel productId="prod-1" />);
      await waitFor(() => expect(screen.queryByText("Cargando imágenes...")).not.toBeInTheDocument());

      await user.click(screen.getByTitle("Eliminar"));
      expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "No" }));

      expect(screen.queryByText("¿Eliminar?")).not.toBeInTheDocument();
      expect(adminProductsApi.deleteImage).not.toHaveBeenCalled();
    });
  });
});
