import { render, screen } from "../../helpers/render";

vi.mock("@/lib/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

import React from "react";
import { ResetPasswordContent } from "@/app/[locale]/(auth)/reset-password/ResetPasswordContent";

describe("ResetPasswordContent", () => {
  beforeEach(() => {
    // Clear search params between tests
    Array.from(mockSearchParams.keys()).forEach((key) => mockSearchParams.delete(key));
  });

  it("shows error state when email param is missing", () => {
    mockSearchParams.set("token", "some-token");

    render(React.createElement(ResetPasswordContent));

    expect(
      screen.getByText("This reset link is invalid or has expired.")
    ).toBeInTheDocument();
    expect(screen.getByText("Request new link")).toBeInTheDocument();
  });

  it("shows error state when token param is missing", () => {
    mockSearchParams.set("email", "test@example.com");

    render(React.createElement(ResetPasswordContent));

    expect(
      screen.getByText("This reset link is invalid or has expired.")
    ).toBeInTheDocument();
  });

  it("shows error state when both params are missing", () => {
    render(React.createElement(ResetPasswordContent));

    expect(
      screen.getByText("This reset link is invalid or has expired.")
    ).toBeInTheDocument();
  });

  it("renders ResetPasswordForm when both params are present", () => {
    mockSearchParams.set("email", "test@example.com");
    mockSearchParams.set("token", "valid-token");

    render(React.createElement(ResetPasswordContent));

    expect(screen.getByText("Create New Password")).toBeInTheDocument();
    expect(screen.getByText("Enter your new password below.")).toBeInTheDocument();
  });

  it("has a link to forgot-password from error state", () => {
    render(React.createElement(ResetPasswordContent));

    const link = screen.getByText("Request new link").closest("a");
    expect(link).toHaveAttribute("href", "/forgot-password");
  });
});
