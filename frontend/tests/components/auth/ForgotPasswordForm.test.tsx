import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, act } from "../../helpers/render";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

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

async function submitEmailAndGoToSuccess() {
  vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ForgotPasswordForm />);

  await user.type(screen.getByLabelText("Email"), "test@test.com");
  await user.click(screen.getByRole("button", { name: "SEND RESET LINK" }));

  await waitFor(() => {
    expect(screen.getByText("Check Your Email")).toBeInTheDocument();
  });

  return user;
}

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("form state", () => {
    it("renders email input with label", () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders 'SEND RESET LINK' button", () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByRole("button", { name: "SEND RESET LINK" })).toBeInTheDocument();
    });

    it("renders 'Back to Sign In' link", () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByText("Back to Sign In")).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows email required error for empty submission", async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.click(screen.getByRole("button", { name: "SEND RESET LINK" }));

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });
  });

  describe("successful submission", () => {
    it("calls authApi.forgotPassword and shows success state", async () => {
      vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.click(screen.getByRole("button", { name: "SEND RESET LINK" }));

      await waitFor(() => {
        expect(authApi.forgotPassword).toHaveBeenCalledWith({ email: "test@test.com" });
        expect(screen.getByText("Check Your Email")).toBeInTheDocument();
      });
    });

    it("displays the sent email in the success message", async () => {
      vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "user@example.com");
      await user.click(screen.getByRole("button", { name: "SEND RESET LINK" }));

      await waitFor(() => {
        expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
      });
    });
  });

  describe("success state interactions", () => {
    it("shows resend button disabled during cooldown", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      await submitEmailAndGoToSuccess();

      const resendBtn = screen.getByRole("button", { name: /Resend in/ });
      expect(resendBtn).toBeDisabled();
    });

    it("enables resend button after cooldown", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      await submitEmailAndGoToSuccess();

      await act(async () => {
        vi.advanceTimersByTime(61000);
      });

      const resendBtn = screen.getByRole("button", { name: "Resend Email" });
      expect(resendBtn).not.toBeDisabled();
    });

    it("clicking 'Try a different email' returns to form", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = await submitEmailAndGoToSuccess();

      await user.click(screen.getByText("Try a different email"));

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.queryByText("Check Your Email")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows generic error message on API failure", async () => {
      vi.mocked(authApi.forgotPassword).mockRejectedValue(new Error("fail"));

      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText("Email"), "test@test.com");
      await user.click(screen.getByRole("button", { name: "SEND RESET LINK" }));

      await waitFor(() => {
        expect(screen.getByText("Could not send email. Please try again.")).toBeInTheDocument();
      });
    });
  });
});
