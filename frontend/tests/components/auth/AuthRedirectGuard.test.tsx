import { render, screen } from "../../helpers/render";
import { AuthRedirectGuard } from "@/components/auth/AuthRedirectGuard";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";

const mockReplace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

import React from "react";

describe("AuthRedirectGuard", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it("renders children when user is not authenticated", () => {
    render(
      <AuthRedirectGuard>
        <span data-testid="child">Protected Content</span>
      </AuthRedirectGuard>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("returns null when user is authenticated", () => {
    useAuthStore.getState().setAuth(createMockAuthResponse());

    const { container } = render(
      <AuthRedirectGuard>
        <span data-testid="child">Protected Content</span>
      </AuthRedirectGuard>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });

  it("calls router.replace('/') when user is authenticated", () => {
    useAuthStore.getState().setAuth(createMockAuthResponse());

    render(
      <AuthRedirectGuard>
        <span>Content</span>
      </AuthRedirectGuard>
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
