import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import { RegisterForm } from "@/components/auth/RegisterForm";
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

describe("RegisterForm", () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders firstName and lastName inputs", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    });

    it("renders email input", () => {
      render(<RegisterForm />);
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });

    it("renders password and confirmPassword inputs", () => {
      render(<RegisterForm />);
      expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    });

    it("renders 'CREATE ACCOUNT' submit button", () => {
      render(<RegisterForm />);
      expect(screen.getByRole("button", { name: "CREATE ACCOUNT" })).toBeInTheDocument();
    });

    it("renders 'Sign In' link to login", () => {
      render(<RegisterForm />);
      const link = screen.getByRole("link", { name: "Sign In" });
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  describe("password requirements", () => {
    it("does not show PasswordRequirements when password is empty", () => {
      render(<RegisterForm />);
      expect(screen.queryByText("Password must contain:")).not.toBeInTheDocument();
    });

    it("shows PasswordRequirements when user starts typing password", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByPlaceholderText("Create a password"), "a");

      await waitFor(() => {
        expect(screen.getByText("Password must contain:")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows email required error when email is empty", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: "CREATE ACCOUNT" }));

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    it("shows password required error when password is empty", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: "CREATE ACCOUNT" }));

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });
  });

  describe("successful submission", () => {
    it("calls authApi.register and redirects on success", async () => {
      const mockResponse = createMockAuthResponse();
      vi.mocked(authApi.register).mockResolvedValue(mockResponse);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText("First Name"), "Test");
      await user.type(screen.getByLabelText("Last Name"), "User");
      await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
      await user.type(screen.getByPlaceholderText("Create a password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");

      // Click the terms checkbox
      const termsCheckbox = screen.getByRole("checkbox", { name: /I agree to the/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole("button", { name: "CREATE ACCOUNT" }));

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          email: "test@test.com",
          password: "Password1",
          confirmPassword: "Password1",
          firstName: "Test",
          lastName: "User",
          language: "en",
        });
      });

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("error handling", () => {
    it("shows 'This email is already registered' for 409 response", async () => {
      vi.mocked(authApi.register).mockRejectedValue(createAxiosError(409));

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
      await user.type(screen.getByPlaceholderText("Create a password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");

      const termsCheckbox = screen.getByRole("checkbox", { name: /I agree to the/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole("button", { name: "CREATE ACCOUNT" }));

      await waitFor(() => {
        expect(screen.getByText(/This email is already registered/)).toBeInTheDocument();
      });
    });

    it("shows generic error for other errors", async () => {
      vi.mocked(authApi.register).mockRejectedValue(createAxiosError(500));

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
      await user.type(screen.getByPlaceholderText("Create a password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");

      const termsCheckbox = screen.getByRole("checkbox", { name: /I agree to the/i });
      await user.click(termsCheckbox);

      await user.click(screen.getByRole("button", { name: "CREATE ACCOUNT" }));

      await waitFor(() => {
        expect(screen.getByText("Could not create account. Please try again.")).toBeInTheDocument();
      });
    });
  });
});
