import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import AdminPagination from "@/components/admin/AdminPagination";

describe("AdminPagination", () => {
  describe("visibilidad", () => {
    it("no renderiza nada cuando totalPages es 0", () => {
      render(<AdminPagination page={1} totalPages={0} onPageChange={vi.fn()} />);

      expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
    });

    it("no renderiza nada cuando totalPages es 1", () => {
      render(<AdminPagination page={1} totalPages={1} onPageChange={vi.fn()} />);

      expect(screen.queryByText(/Página/)).not.toBeInTheDocument();
    });

    it("renderiza el indicador de página cuando hay múltiples páginas", () => {
      render(<AdminPagination page={2} totalPages={5} onPageChange={vi.fn()} />);

      expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
    });

    it("renderiza los botones Anterior y Siguiente", () => {
      render(<AdminPagination page={2} totalPages={5} onPageChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: /Anterior/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Siguiente/ })).toBeInTheDocument();
    });
  });

  describe("estado de los botones", () => {
    it("deshabilita 'Anterior' en la primera página", () => {
      render(<AdminPagination page={1} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    });

    it("habilita 'Anterior' en páginas posteriores a la primera", () => {
      render(<AdminPagination page={2} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: /Anterior/ })).not.toBeDisabled();
    });

    it("deshabilita 'Siguiente' en la última página", () => {
      render(<AdminPagination page={3} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: /Siguiente/ })).toBeDisabled();
    });

    it("habilita 'Siguiente' en páginas anteriores a la última", () => {
      render(<AdminPagination page={2} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: /Siguiente/ })).not.toBeDisabled();
    });
  });

  describe("navegación", () => {
    it("al hacer clic en 'Anterior' llama a onPageChange con page - 1", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<AdminPagination page={3} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByRole("button", { name: /Anterior/ }));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("al hacer clic en 'Siguiente' llama a onPageChange con page + 1", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<AdminPagination page={2} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByRole("button", { name: /Siguiente/ }));

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });
});
