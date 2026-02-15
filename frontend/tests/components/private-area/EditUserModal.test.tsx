import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import EditUserModal from "@/components/private-area/EditUserModal";
import type { UserDto } from "@/types/auth";
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
    updateUser: vi.fn(),
  },
}));

import { authApi } from "@/lib/api/auth";

describe("EditUserModal", () => {
  const mockCurrentUser: UserDto = {
    id: "user-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    language: "en",
    emailVerified: true,
    roles: ["user"],
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("does not render when isOpen is false", () => {
      render(
        <EditUserModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      expect(screen.queryByText("Edit Personal Information")).not.toBeInTheDocument();
    });

    it("renders when isOpen is true", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      expect(screen.getByText("Edit Personal Information")).toBeInTheDocument();
    });

    it("renders email input with current value", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const emailInput = screen.getByLabelText("Email *");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("renders firstName input with current value", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const firstNameInput = screen.getByLabelText("First Name");
      expect(firstNameInput).toBeInTheDocument();
      expect(firstNameInput).toHaveValue("John");
    });

    it("renders lastName input with current value", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const lastNameInput = screen.getByLabelText("Last Name");
      expect(lastNameInput).toBeInTheDocument();
      expect(lastNameInput).toHaveValue("Doe");
    });

    it("renders cancel and save buttons", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("renders close button in header", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("form initialization", () => {
    it("populates form with current user data", () => {
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      expect(screen.getByLabelText("Email *")).toHaveValue("test@example.com");
      expect(screen.getByLabelText("First Name")).toHaveValue("John");
      expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    });

    it("handles user without firstName and lastName", () => {
      const userWithoutNames = {
        ...mockCurrentUser,
        firstName: undefined,
        lastName: undefined,
      };

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={userWithoutNames}
        />
      );

      expect(screen.getByLabelText("First Name")).toHaveValue("");
      expect(screen.getByLabelText("Last Name")).toHaveValue("");
    });
  });

  describe("interactions", () => {
    it("calls onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close button in header is clicked", async () => {
      const user = userEvent.setup();
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const closeButton = screen.getByLabelText("Close modal");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("allows editing form fields", async () => {
      const user = userEvent.setup();
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const emailInput = screen.getByLabelText("Email *");
      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");

      await user.clear(emailInput);
      await user.type(emailInput, "newemail@example.com");

      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      await user.clear(lastNameInput);
      await user.type(lastNameInput, "Smith");

      expect(emailInput).toHaveValue("newemail@example.com");
      expect(firstNameInput).toHaveValue("Jane");
      expect(lastNameInput).toHaveValue("Smith");
    });
  });

  describe("form submission", () => {
    it("submits form with updated values", async () => {
      const user = userEvent.setup();
      const updatedUser = {
        ...mockCurrentUser,
        email: "newemail@example.com",
        firstName: "Jane",
        lastName: "Smith",
      };

      vi.mocked(authApi.updateUser).mockResolvedValue(updatedUser);

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      // Update fields
      const emailInput = screen.getByLabelText("Email *");
      await user.clear(emailInput);
      await user.type(emailInput, "newemail@example.com");

      const firstNameInput = screen.getByLabelText("First Name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const lastNameInput = screen.getByLabelText("Last Name");
      await user.clear(lastNameInput);
      await user.type(lastNameInput, "Smith");

      // Submit form
      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(authApi.updateUser).toHaveBeenCalledWith({
          email: "newemail@example.com",
          firstName: "Jane",
          lastName: "Smith",
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(updatedUser);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.updateUser).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCurrentUser), 100))
      );

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      expect(screen.getByRole("button", { name: "Saving..." })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      });
    });

    it("disables save button during submission", async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.updateUser).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCurrentUser), 100))
      );

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it("displays error message on submission failure", async () => {
      const user = userEvent.setup();
      const errorResponse = new AxiosError(
        "Update failed",
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        {
          status: 400,
          data: { message: "Email already exists" },
          statusText: "Bad Request",
          headers: {},
          config: { headers: new AxiosHeaders() },
        }
      );

      vi.mocked(authApi.updateUser).mockRejectedValue(errorResponse);

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("submits with empty firstName and lastName as undefined", async () => {
      const user = userEvent.setup();
      vi.mocked(authApi.updateUser).mockResolvedValue(mockCurrentUser);

      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      // Clear optional fields
      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      await user.clear(firstNameInput);
      await user.clear(lastNameInput);

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(authApi.updateUser).toHaveBeenCalledWith({
          email: "test@example.com",
          firstName: undefined,
          lastName: undefined,
        });
      });
    });
  });

  describe("validation", () => {
    it("requires email field", async () => {
      const user = userEvent.setup();
      render(
        <EditUserModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          currentUser={mockCurrentUser}
        />
      );

      const emailInput = screen.getByLabelText("Email *");
      await user.clear(emailInput);

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      // HTML5 validation should prevent submission
      expect(authApi.updateUser).not.toHaveBeenCalled();
    });
  });
});
