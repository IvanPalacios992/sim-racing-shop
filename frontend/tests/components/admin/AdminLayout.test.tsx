import React from "react";
import { render, screen } from "../../helpers/render";
import AdminLayout from "@/components/admin/AdminLayout";

let mockPathname = "/admin/categorias";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next/link", () => ({
  default: (props: {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    const { href, children, ...rest } = props;
    return React.createElement("a", { href, ...rest }, children);
  },
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    mockPathname = "/admin/categorias";
  });

  describe("sidebar - elementos de navegación", () => {
    it("muestra el título 'Administración' en el sidebar", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      expect(screen.getByText("Administración")).toBeInTheDocument();
    });

    it("renderiza el enlace a Categorías", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      const link = screen.getByRole("link", { name: /categorías/i });
      expect(link).toHaveAttribute("href", "/admin/categorias");
    });

    it("renderiza el enlace a Componentes", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      const link = screen.getByRole("link", { name: /componentes/i });
      expect(link).toHaveAttribute("href", "/admin/componentes");
    });

    it("renderiza el enlace a Productos", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      const link = screen.getByRole("link", { name: /productos/i });
      expect(link).toHaveAttribute("href", "/admin/productos");
    });

    it("renderiza el enlace a Pedidos", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      const link = screen.getByRole("link", { name: /pedidos/i });
      expect(link).toHaveAttribute("href", "/admin/pedidos");
    });

    it("renderiza exactamente 4 elementos de navegación", () => {
      render(<AdminLayout>contenido</AdminLayout>);

      const navLinks = screen.getAllByRole("link");
      expect(navLinks).toHaveLength(4);
    });
  });

  describe("estado activo del enlace de navegación", () => {
    it("marca Categorías como activo en /admin/categorias", () => {
      mockPathname = "/admin/categorias";
      render(<AdminLayout>contenido</AdminLayout>);

      const categoriasLink = screen.getByRole("link", { name: /categorías/i });
      expect(categoriasLink.className).toContain("bg-racing-red");
    });

    it("no marca Componentes como activo en /admin/categorias", () => {
      mockPathname = "/admin/categorias";
      render(<AdminLayout>contenido</AdminLayout>);

      const componentesLink = screen.getByRole("link", { name: /componentes/i });
      expect(componentesLink.className).not.toContain("bg-racing-red");
    });

    it("marca Componentes como activo en /admin/componentes", () => {
      mockPathname = "/admin/componentes";
      render(<AdminLayout>contenido</AdminLayout>);

      const componentesLink = screen.getByRole("link", { name: /componentes/i });
      expect(componentesLink.className).toContain("bg-racing-red");
    });

    it("marca Pedidos como activo en /admin/pedidos", () => {
      mockPathname = "/admin/pedidos";
      render(<AdminLayout>contenido</AdminLayout>);

      const pedidosLink = screen.getByRole("link", { name: /pedidos/i });
      expect(pedidosLink.className).toContain("bg-racing-red");
    });

    it("marca Productos como activo en /admin/productos", () => {
      mockPathname = "/admin/productos";
      render(<AdminLayout>contenido</AdminLayout>);

      const productosLink = screen.getByRole("link", { name: /productos/i });
      expect(productosLink.className).toContain("bg-racing-red");
    });
  });

  describe("área de contenido principal", () => {
    it("renderiza el contenido hijo en el área principal", () => {
      render(
        <AdminLayout>
          <span data-testid="page-content">Contenido de la página</span>
        </AdminLayout>,
      );

      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });

    it("renderiza múltiples hijos", () => {
      render(
        <AdminLayout>
          <h1 data-testid="title">Título</h1>
          <p data-testid="body">Cuerpo</p>
        </AdminLayout>,
      );

      expect(screen.getByTestId("title")).toBeInTheDocument();
      expect(screen.getByTestId("body")).toBeInTheDocument();
    });
  });
});
