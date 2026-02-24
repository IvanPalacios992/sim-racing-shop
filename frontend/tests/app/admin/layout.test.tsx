import React from "react";
import { render, screen } from "../../helpers/render";
import Layout from "@/app/[locale]/(admin)/layout";

vi.mock("@/components/admin/AdminGuard", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "admin-guard" }, children),
}));

vi.mock("@/components/admin/AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "admin-layout" }, children),
}));

describe("Admin Layout", () => {
  it("envuelve el contenido en AdminGuard", () => {
    render(<Layout>contenido</Layout>);

    expect(screen.getByTestId("admin-guard")).toBeInTheDocument();
  });

  it("envuelve el contenido en AdminLayout (dentro del guard)", () => {
    render(<Layout>contenido</Layout>);

    const guard = screen.getByTestId("admin-guard");
    expect(guard.querySelector("[data-testid='admin-layout']")).toBeInTheDocument();
  });

  it("renderiza los hijos dentro del layout", () => {
    render(
      <Layout>
        <span data-testid="page-content">Página admin</span>
      </Layout>,
    );

    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });
});
