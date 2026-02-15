import { render, screen, waitFor } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import SettingsContent from "@/components/private-area/SettingsContent";
import { communicationPreferencesApi } from "@/lib/api/communication-preferences";
import { authApi } from "@/lib/api/auth";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/configuracion",
}));

// Mock API modules
vi.mock("@/lib/api/communication-preferences");
vi.mock("@/lib/api/auth");
vi.mock("@/lib/api-client", () => ({
  default: {
    delete: vi.fn(),
  },
}));

// Mock auth store
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

describe("SettingsContent", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    language: "en",
    emailVerified: true,
    roles: ["User"],
  };

  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  describe("Communication Preferences Section", () => {
    it("renders communication preferences section", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      expect(screen.getByText("Communication Preferences")).toBeInTheDocument();
    });

    it("loads and displays preferences on mount", async () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: true,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      await waitFor(() => {
        expect(communicationPreferencesApi.getPreferences).toHaveBeenCalled();
      });
    });

    it("displays loading state while fetching preferences", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<SettingsContent />);

      // Look for the loading spinner by its class
      const spinners = document.querySelectorAll('.animate-spin');
      expect(spinners.length).toBeGreaterThan(0);
    });

    it("displays error message when loading preferences fails", async () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockRejectedValue(
        new Error("Failed to load")
      );

      render(<SettingsContent />);

      await waitFor(() => {
        expect(screen.getByText("Error loading preferences. Please try again.")).toBeInTheDocument();
      });
    });

    it("updates preference when toggle is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(communicationPreferencesApi.updatePreferences).mockResolvedValue({
        newsletter: true,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      await waitFor(() => {
        expect(communicationPreferencesApi.getPreferences).toHaveBeenCalled();
      });

      const newsletterSwitch = screen.getByLabelText("Newsletter");
      await user.click(newsletterSwitch);

      await waitFor(() => {
        expect(communicationPreferencesApi.updatePreferences).toHaveBeenCalledWith({
          newsletter: true,
          orderNotifications: true,
          smsPromotions: false,
        });
      });
    });

    it("displays success message after updating preferences", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(communicationPreferencesApi.updatePreferences).mockResolvedValue({
        newsletter: true,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      await waitFor(() => {
        expect(communicationPreferencesApi.getPreferences).toHaveBeenCalled();
      });

      const newsletterSwitch = screen.getByLabelText("Newsletter");
      await user.click(newsletterSwitch);

      await waitFor(() => {
        expect(screen.getByText("Preferences saved successfully")).toBeInTheDocument();
      });
    });

    it("reverts preference and shows error when update fails", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(communicationPreferencesApi.updatePreferences).mockRejectedValue(
        new Error("Update failed")
      );

      render(<SettingsContent />);

      await waitFor(() => {
        expect(communicationPreferencesApi.getPreferences).toHaveBeenCalled();
      });

      const newsletterSwitch = screen.getByLabelText("Newsletter");
      await user.click(newsletterSwitch);

      await waitFor(() => {
        expect(screen.getByText("Error saving preferences. Please try again.")).toBeInTheDocument();
      });
    });
  });

  describe("Security Section", () => {
    it("renders security section", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      expect(screen.getByText("Security")).toBeInTheDocument();
    });

    it("sends password reset email when button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(authApi.forgotPassword).mockResolvedValue();

      render(<SettingsContent />);

      const resetButton = screen.getByText("SEND PASSWORD CHANGE EMAIL");
      await user.click(resetButton);

      await waitFor(() => {
        expect(authApi.forgotPassword).toHaveBeenCalledWith({
          email: mockUser.email,
        });
      });
    });

    it("displays success message after sending reset email", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(authApi.forgotPassword).mockResolvedValue();

      render(<SettingsContent />);

      const resetButton = screen.getByText("SEND PASSWORD CHANGE EMAIL");
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText("Password reset email sent successfully. Check your inbox.")).toBeInTheDocument();
      });
    });

    it("displays error message when reset email fails", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(authApi.forgotPassword).mockRejectedValue(new Error("Email failed"));

      render(<SettingsContent />);

      const resetButton = screen.getByText("SEND PASSWORD CHANGE EMAIL");
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText("Error sending email. Please try again.")).toBeInTheDocument();
      });
    });
  });

  describe("Danger Zone Section", () => {
    it("renders danger zone section", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("opens confirmation modal when delete button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });
    });

    it("closes modal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/This action is permanent/)).not.toBeInTheDocument();
      });
    });

    it("disables confirm button when email does not match", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("DELETE MY ACCOUNT");
      expect(confirmButton).toBeDisabled();
    });

    it("enables confirm button when email matches", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(mockUser.email);
      await user.type(emailInput, mockUser.email);

      const confirmButton = screen.getByText("DELETE MY ACCOUNT");
      expect(confirmButton).not.toBeDisabled();
    });

    it("keeps confirm button disabled when wrong email is entered", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(mockUser.email);
      await user.type(emailInput, "wrong@example.com");

      const confirmButton = screen.getByText("DELETE MY ACCOUNT");
      // Button should remain disabled with wrong email
      expect(confirmButton).toBeDisabled();
    });

    it("deletes account and redirects when confirmed with correct email", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(apiClient.delete).mockResolvedValue({});

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(mockUser.email);
      await user.type(emailInput, mockUser.email);

      const confirmButton = screen.getByText("DELETE MY ACCOUNT");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith("/user");
        expect(mockLogout).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("shows error when account deletion fails", async () => {
      const user = userEvent.setup();
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });
      vi.mocked(apiClient.delete).mockRejectedValue(new Error("Delete failed"));

      render(<SettingsContent />);

      const deleteButton = screen.getByText("DELETE ACCOUNT");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Delete Account")).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(mockUser.email);
      await user.type(emailInput, mockUser.email);

      const confirmButton = screen.getByText("DELETE MY ACCOUNT");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Error deleting account. Please try again.")).toBeInTheDocument();
      });
    });
  });

  describe("Layout and Rendering", () => {
    it("renders all three main sections", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      expect(screen.getByText("Communication Preferences")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("renders page title and subtitle", () => {
      vi.mocked(communicationPreferencesApi.getPreferences).mockResolvedValue({
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      });

      render(<SettingsContent />);

      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Manage your account settings and preferences")).toBeInTheDocument();
    });
  });
});
