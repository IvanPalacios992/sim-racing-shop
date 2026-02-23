import React from "react";
import { render, screen } from "../../helpers/render";
import CategoriasPage from "@/app/[locale]/(admin)/admin/categorias/page";

vi.mock("@/components/admin/categories/CategoriesContent", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "categories-content" }, "CategoriesContent"),
}));

describe("CategoriasPage", () => {
  it("renderiza el componente CategoriesContent", () => {
    render(<CategoriasPage />);

    expect(screen.getByTestId("categories-content")).toBeInTheDocument();
  });

  it("no renderiza contenido distinto al de CategoriesContent", () => {
    const { container } = render(<CategoriasPage />);

    // Solo debe existir el wrapper de CategoriesContent
    expect(container.firstChild).toBe(screen.getByTestId("categories-content"));
  });
});
