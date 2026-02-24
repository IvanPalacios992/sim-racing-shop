import React from "react";
import { render, screen } from "../../helpers/render";
import ComponentesPage from "@/app/[locale]/(admin)/admin/componentes/page";

vi.mock("@/components/admin/components/ComponentsContent", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "components-content" }, "ComponentsContent"),
}));

describe("ComponentesPage", () => {
  it("renderiza el componente ComponentsContent", () => {
    render(<ComponentesPage />);

    expect(screen.getByTestId("components-content")).toBeInTheDocument();
  });

  it("no renderiza contenido distinto al de ComponentsContent", () => {
    const { container } = render(<ComponentesPage />);

    expect(container.firstChild).toBe(screen.getByTestId("components-content"));
  });
});
