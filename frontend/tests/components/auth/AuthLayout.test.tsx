import { render, screen } from "../../helpers/render";
import React from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

describe("AuthLayout", () => {
  it("renders children", () => {
    render(
      React.createElement(AuthLayout, null,
        React.createElement("div", null, "Form content")
      )
    );

    expect(screen.getByText("Form content")).toBeInTheDocument();
  });

  it("does not render brand panel by default", () => {
    render(
      React.createElement(AuthLayout, null,
        React.createElement("div", null, "Form content")
      )
    );

    expect(screen.queryByText("Brand")).not.toBeInTheDocument();
  });

  it("renders brand panel when showBrandPanel is true", () => {
    render(
      React.createElement(
        AuthLayout,
        {
          showBrandPanel: true,
          brandContent: React.createElement("div", null, "Brand content here"),
        },
        React.createElement("div", null, "Form content")
      )
    );

    expect(screen.getByText("Brand content here")).toBeInTheDocument();
    expect(screen.getByText("Form content")).toBeInTheDocument();
  });

  it("applies full width when brand panel is hidden", () => {
    const { container } = render(
      React.createElement(AuthLayout, null,
        React.createElement("div", null, "Form content")
      )
    );

    const formPanel = container.querySelector(".w-full");
    expect(formPanel).toBeInTheDocument();
  });
});
