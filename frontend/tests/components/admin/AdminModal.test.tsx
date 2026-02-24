import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import AdminModal from "@/components/admin/AdminModal";

describe("AdminModal", () => {
  describe("visibility", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <AdminModal isOpen={false} onClose={vi.fn()} title="Test">
          <span>Content</span>
        </AdminModal>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renders the modal when isOpen is true", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Mi Modal">
          <span>Contenido</span>
        </AdminModal>
      );

      expect(screen.getByText("Mi Modal")).toBeInTheDocument();
      expect(screen.getByText("Contenido")).toBeInTheDocument();
    });
  });

  describe("title", () => {
    it("displays the provided title", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Nuevo producto">
          <div />
        </AdminModal>
      );

      expect(screen.getByText("Nuevo producto")).toBeInTheDocument();
    });
  });

  describe("children", () => {
    it("renders children inside the modal", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Test">
          <button>Guardar</button>
          <input placeholder="Nombre" />
        </AdminModal>
      );

      expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
    });
  });

  describe("close button", () => {
    it("renders a close button with aria-label 'Cerrar modal'", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Test">
          <div />
        </AdminModal>
      );

      expect(screen.getByRole("button", { name: "Cerrar modal" })).toBeInTheDocument();
    });

    it("calls onClose when the close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <AdminModal isOpen={true} onClose={onClose} title="Test">
          <div />
        </AdminModal>
      );

      await user.click(screen.getByRole("button", { name: "Cerrar modal" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
