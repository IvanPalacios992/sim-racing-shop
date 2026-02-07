import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../helpers/render";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../helpers/auth-store";

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

import { authApi } from "@/lib/api/auth";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement("a", { href: props.href, className: props.className }, props.children),
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
import { HomeContent } from "@/app/[locale]/HomeContent";

describe("HomeContent", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  describe("unauthenticated state", () => {
    it("renders sign in and create account links", () => {
      render(React.createElement(HomeContent));

      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    it("renders the tagline", () => {
      render(React.createElement(HomeContent));

      expect(
        screen.getByText("Premium sim racing equipment for those who demand perfection")
      ).toBeInTheDocument();
    });

    it("has correct links", () => {
      render(React.createElement(HomeContent));

      expect(screen.getByText("Sign In").closest("a")).toHaveAttribute("href", "/login");
      expect(screen.getByText("Create Account").closest("a")).toHaveAttribute("href", "/register");
    });
  });

  describe("authenticated state", () => {
    it("shows welcome message with firstName", () => {
      const mockResponse = createMockAuthResponse({ user: { firstName: "John" } });
      useAuthStore.getState().setAuth(mockResponse);

      render(React.createElement(HomeContent));

      expect(screen.getByText("Welcome, John")).toBeInTheDocument();
    });

    it("falls back to email when firstName is not set", () => {
      const mockResponse = createMockAuthResponse();
      mockResponse.user.firstName = undefined;
      useAuthStore.getState().setAuth(mockResponse);

      render(React.createElement(HomeContent));

      expect(screen.getByText(`Welcome, ${mockResponse.user.email}`)).toBeInTheDocument();
    });

    it("shows logout button instead of sign in links", () => {
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);

      render(React.createElement(HomeContent));

      expect(screen.getByText("Log Out")).toBeInTheDocument();
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Create Account")).not.toBeInTheDocument();
    });

    it("calls authApi.logout and store.logout on logout click", async () => {
      const user = userEvent.setup();
      const mockResponse = createMockAuthResponse();
      useAuthStore.getState().setAuth(mockResponse);
      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      render(React.createElement(HomeContent));

      await user.click(screen.getByText("Log Out"));

      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
      });
    });

  });
});
