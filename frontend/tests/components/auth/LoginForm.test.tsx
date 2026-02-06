import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/stores/auth-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { AxiosError, AxiosHeaders } from "axios";

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

const mockPush = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href: props.href }, props.children),
  useRouter: () => ({
    push: mockPush,
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

function createAxiosError(status: number): AxiosError {
  return new AxiosError("Error", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: {},
    statusText: "Error",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe("LoginForm", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders email input with label", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders password input with label", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders 'Remember me' checkbox", () => {
      render(<LoginForm />);
      expect(screen.getByText("Remember me")).toBeInTheDocument();
    });

    it("renders 'Forgot password?' link", () => {
      render(<LoginForm />);
      const link = screen.getByText("Forgot password?");
      expect(link.closest("a")).toHaveAttribute("href", "/forgot-password");
    });

    it("renders 'SIGN IN' submit button", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
    });

    it("renders 'Create one' link to register", () => {
      render(<LoginForm />);
      const link = screen.getByText("Create one");
      expect(link.closest("a")).toHaveAttribute("href", "/register");
    });
  });

  describe("validation", () => {
    it("shows error when submitting empty email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    it("does not call API when submitting with invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "bad");
      await user.type(screen.getByLabelText("Password"), "somepass");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      // Wait for validation to run, then check API was not called
      await waitFor(() => {
        expect(authApi.login).not.toHaveBeenCalled();
      });
    });

    it("shows error when submitting empty password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });
  });

  describe("successful submission", () => {
    it("calls authApi.login and redirects on success", async () => {
      const mockResponse = createMockAuthResponse();
      vi.mocked(authApi.login).mockResolvedValue(mockResponse);

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.type(screen.getByLabelText("Password"), "Password1");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: "test@test.com",
          password: "Password1",
          rememberMe: false,
        });
      });

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("error handling", () => {
    it("shows 'Invalid email or password' for 401 response", async () => {
      vi.mocked(authApi.login).mockRejectedValue(createAxiosError(401));

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password. Please try again.")).toBeInTheDocument();
      });
    });

    it("shows account locked message for 423 response", async () => {
      vi.mocked(authApi.login).mockRejectedValue(createAxiosError(423));

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText(/Account temporarily locked/)).toBeInTheDocument();
      });
    });

    it("shows unverified email message for 403 response", async () => {
      vi.mocked(authApi.login).mockRejectedValue(createAxiosError(403));

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText("Please verify your email before signing in.")).toBeInTheDocument();
      });
    });

    it("shows generic error for other errors", async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "SIGN IN" }));

      await waitFor(() => {
        expect(screen.getByText("Could not sign in. Please try again.")).toBeInTheDocument();
      });
    });
  });
});
