import React from "react";
import { render, screen } from "../../helpers/render";
import ProductosPage from "@/app/[locale]/(admin)/admin/productos/page";

vi.mock("@/components/admin/products/ProductsContent", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "products-content" }, "ProductsContent"),
}));

describe("ProductosPage", () => {
  it("renderiza el componente ProductsContent", () => {
    render(<ProductosPage />);

    expect(screen.getByTestId("products-content")).toBeInTheDocument();
  });

  it("no renderiza contenido distinto al de ProductsContent", () => {
    const { container } = render(<ProductosPage />);

    expect(container.firstChild).toBe(screen.getByTestId("products-content"));
  });
});
