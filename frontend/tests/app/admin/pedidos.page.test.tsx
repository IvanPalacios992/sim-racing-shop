import React from "react";
import { render, screen } from "../../helpers/render";
import PedidosAdminPage from "@/app/[locale]/(admin)/admin/pedidos/page";

vi.mock("@/components/admin/orders/OrdersAdminContent", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "orders-admin-content" }, "OrdersAdminContent"),
}));

describe("PedidosAdminPage", () => {
  it("renderiza el componente OrdersAdminContent", () => {
    render(<PedidosAdminPage />);

    expect(screen.getByTestId("orders-admin-content")).toBeInTheDocument();
  });

  it("no renderiza contenido distinto al de OrdersAdminContent", () => {
    const { container } = render(<PedidosAdminPage />);

    expect(container.firstChild).toBe(screen.getByTestId("orders-admin-content"));
  });
});
