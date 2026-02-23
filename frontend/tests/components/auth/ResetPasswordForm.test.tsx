import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
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

function createAxiosError(status: number): AxiosError {
  return new AxiosError("Error", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: {},
    statusText: "Error",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const defaultProps = { email: "user@test.com", token: "valid-token" };

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("form state", () => {
    it("renders newPassword and confirmPassword inputs", () => {
      render(<ResetPasswordForm {...defaultProps} />);
      expect(screen.getByPlaceholderText("Enter your new password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Confirm your new password")).toBeInTheDocument();
    });

    it("renders 'RESET PASSWORD' submit button", () => {
      render(<ResetPasswordForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: "RESET PASSWORD" })).toBeInTheDocument();
    });

    it("shows PasswordRequirements when typing in newPassword", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "a");

      await waitFor(() => {
        expect(screen.getByText("Password must contain:")).toBeInTheDocument();
      });
    });
  });

  describe("validation", () => {
    it("shows error for empty newPassword", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("shows error for weak newPassword", async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "weak");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "weak");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      });
    });
  });

  describe("successful submission", () => {
    it("calls authApi.resetPassword and shows success state", async () => {
      vi.mocked(authApi.resetPassword).mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(authApi.resetPassword).toHaveBeenCalledWith({
          email: "user@test.com",
          token: "valid-token",
          newPassword: "NewPassword1",
          confirmPassword: "NewPassword1",
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Password Reset Complete")).toBeInTheDocument();
        expect(screen.getByText("SIGN IN NOW")).toBeInTheDocument();
      });
    });

    it("success state links to /login", async () => {
      vi.mocked(authApi.resetPassword).mockResolvedValue(undefined);

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        const link = screen.getByText("SIGN IN NOW").closest("a");
        expect(link).toHaveAttribute("href", "/login");
      });
    });
  });

  describe("invalid token", () => {
    it("shows invalid token message for 400 response", async () => {
      vi.mocked(authApi.resetPassword).mockRejectedValue(createAxiosError(400));

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(screen.getByText("This reset link is invalid or has expired.")).toBeInTheDocument();
      });
    });

    it("shows invalid token message for 404 response", async () => {
      vi.mocked(authApi.resetPassword).mockRejectedValue(createAxiosError(404));

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(screen.getByText("This reset link is invalid or has expired.")).toBeInTheDocument();
      });
    });

    it("shows 'Request new link' button linking to /forgot-password", async () => {
      vi.mocked(authApi.resetPassword).mockRejectedValue(createAxiosError(400));

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        const link = screen.getByText("Request new link").closest("a");
        expect(link).toHaveAttribute("href", "/forgot-password");
      });
    });
  });

  describe("error handling", () => {
    it("shows generic error for other API errors", async () => {
      vi.mocked(authApi.resetPassword).mockRejectedValue(createAxiosError(500));

      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Enter your new password"), "NewPassword1");
      await user.type(screen.getByPlaceholderText("Confirm your new password"), "NewPassword1");
      await user.click(screen.getByRole("button", { name: "RESET PASSWORD" }));

      await waitFor(() => {
        expect(screen.getByText("Could not reset password. Please try again.")).toBeInTheDocument();
      });
    });
  });
});
