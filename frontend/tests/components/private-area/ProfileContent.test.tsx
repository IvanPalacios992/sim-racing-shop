import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import ProfileContent from "@/components/private-area/ProfileContent";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { useAuthStore } from "@/stores/auth-store";
import type { UserDto } from "@/types/auth";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto } from "@/types/addresses";

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

vi.mock("@/lib/api/addresses", () => ({
  addressesApi: {
    getBillingAddress: vi.fn(),
    createBillingAddress: vi.fn(),
    updateBillingAddress: vi.fn(),
    getDeliveryAddresses: vi.fn(),
    createDeliveryAddress: vi.fn(),
    updateDeliveryAddress: vi.fn(),
    deleteDeliveryAddress: vi.fn(),
  },
}));

import { authApi } from "@/lib/api/auth";
import { addressesApi } from "@/lib/api/addresses";

describe("ProfileContent", () => {
  const mockUser: UserDto = {
    id: "user-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    language: "en",
    emailVerified: true,
    roles: ["user"],
  };

  const mockBillingAddress: BillingAddressDetailDto = {
    id: "billing-123",
    userId: "user-123",
    street: "123 Main Street",
    city: "Madrid",
    state: "Madrid",
    postalCode: "28001",
    country: "España",
  };

  const mockDeliveryAddresses: DeliveryAddressDetailDto[] = [
    {
      id: "delivery-123",
      userId: "user-123",
      name: "Casa",
      street: "123 Main Street",
      city: "Madrid",
      state: "Madrid",
      postalCode: "28001",
      country: "España",
      isDefault: true,
    },
    {
      id: "delivery-456",
      userId: "user-123",
      name: "Trabajo",
      street: "456 Work Avenue",
      city: "Barcelona",
      state: "Catalunya",
      postalCode: "08001",
      country: "España",
      isDefault: false,
    },
  ];

  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();

    // Set up auth store with hydrated state
    const mockAuthResponse = createMockAuthResponse();
    useAuthStore.getState().setAuth(mockAuthResponse);
    useAuthStore.setState({ _hasHydrated: true });

    // Mock API responses
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);
    vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(mockBillingAddress);
    vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue(mockDeliveryAddresses);
  });

  describe("loading state", () => {
    it("shows loading message initially", () => {
      render(<ProfileContent />);
      expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("shows loading until data is fetched", async () => {
      vi.mocked(authApi.getMe).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 50))
      );

      render(<ProfileContent />);
      expect(screen.getByText("Loading profile...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
      });
    });
  });

  describe("rendering with data", () => {
    it("renders profile header", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
        expect(screen.getByText("Manage your personal information and preferences")).toBeInTheDocument();
      });
    });

    it("renders stats cards", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Total Orders")).toBeInTheDocument();
        expect(screen.getByText("Total Spent")).toBeInTheDocument();
        expect(screen.getByText("Favorite Products")).toBeInTheDocument();
        expect(screen.getByText("Member Level")).toBeInTheDocument();
      });
    });

    it("renders personal information section with user data", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Personal Information")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("Verified")).toBeInTheDocument();
      });
    });

    it("renders edit button in personal information section", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        const editButton = screen.getByLabelText("Edit personal information");
        expect(editButton).toBeInTheDocument();
      });
    });

    it("renders billing address section with data", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Billing Address")).toBeInTheDocument();
        expect(screen.getAllByText("123 Main Street")[0]).toBeInTheDocument();
        const addressElements = screen.getAllByText("28001 Madrid, Madrid");
        expect(addressElements.length).toBeGreaterThan(0);
      });
    });

    it("renders delivery addresses section with multiple addresses", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Delivery Addresses")).toBeInTheDocument();
        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(screen.getByText("Trabajo")).toBeInTheDocument();
        expect(screen.getByText("Default")).toBeInTheDocument();
      });
    });

    it("renders add delivery address button when addresses exist", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Add delivery address")).toBeInTheDocument();
      });
    });
  });

  describe("no data scenarios", () => {
    it("shows message when no billing address exists", async () => {
      vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(null);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("You don't have a billing address registered")).toBeInTheDocument();
        expect(screen.getByText("Add billing address")).toBeInTheDocument();
      });
    });

    it("shows message when no delivery addresses exist", async () => {
      vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue([]);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("You don't have any delivery addresses registered")).toBeInTheDocument();
      });
    });

    it("shows 'Not provided' when user has no first and last name", async () => {
      const userWithoutNames = {
        ...mockUser,
        firstName: undefined,
        lastName: undefined,
      };
      vi.mocked(authApi.getMe).mockResolvedValue(userWithoutNames);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Not provided")).toBeInTheDocument();
      });
    });
  });

  describe("modal interactions", () => {
    it("opens edit user modal when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText("Edit personal information");
      await user.click(editButton);

      expect(screen.getByText("Edit Personal Information")).toBeInTheDocument();
    });

    it("opens billing address modal when add button is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(null);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("You don't have a billing address registered")).toBeInTheDocument();
      });

      const addButton = screen.getByText("Add billing address");
      await user.click(addButton);

      expect(screen.getByText("New Billing Address")).toBeInTheDocument();
    });

    it("opens delivery address modal when add button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Casa")).toBeInTheDocument();
      });

      const addButton = screen.getByText("Add delivery address");
      await user.click(addButton);

      expect(screen.getByText("New Delivery Address")).toBeInTheDocument();
    });

    it("closes modal when cancel is clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(null);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Add billing address")).toBeInTheDocument();
      });

      const addButton = screen.getByText("Add billing address");
      await user.click(addButton);

      expect(screen.getByText("New Billing Address")).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("New Billing Address")).not.toBeInTheDocument();
      });
    });
  });

  describe("data fetching", () => {
    it("fetches user, billing address, and delivery addresses on mount", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        expect(authApi.getMe).toHaveBeenCalledTimes(1);
        expect(addressesApi.getBillingAddress).toHaveBeenCalledTimes(1);
        expect(addressesApi.getDeliveryAddresses).toHaveBeenCalledTimes(1);
      });
    });

    it("updates authStore with fresh user data", async () => {
      render(<ProfileContent />);

      await waitFor(() => {
        const storeUser = useAuthStore.getState().user;
        expect(storeUser).toEqual(mockUser);
      });
    });

    it("waits for hydration before fetching data", () => {
      useAuthStore.setState({ _hasHydrated: false });

      render(<ProfileContent />);

      expect(authApi.getMe).not.toHaveBeenCalled();
      expect(addressesApi.getBillingAddress).not.toHaveBeenCalled();
      expect(addressesApi.getDeliveryAddresses).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("displays error message when data fetching fails", async () => {
      vi.mocked(authApi.getMe).mockRejectedValue(new Error("Network error"));

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Error loading profile")).toBeInTheDocument();
      });
    });

    it("shows error when no user data is available", async () => {
      vi.mocked(authApi.getMe).mockResolvedValue(null as unknown as UserDto);

      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getByText("Could not load user information")).toBeInTheDocument();
      });
    });
  });

  describe("address editing", () => {
    it("opens billing address modal in edit mode when edit is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileContent />);

      await waitFor(() => {
        expect(screen.getAllByText("123 Main Street")[0]).toBeInTheDocument();
      });

      // Find all edit buttons and click the first one (billing address edit)
      const editButtons = screen.getAllByLabelText("Edit");
      await user.click(editButtons[0]);

      expect(screen.getByText("Edit Billing Address")).toBeInTheDocument();
    });
  });

  describe("address deletion", () => {
    it("calls delete API and refreshes addresses when delivery address is deleted", async () => {
      const user = userEvent.setup();
      vi.mocked(addressesApi.deleteDeliveryAddress).mockResolvedValue();

      // First call returns both addresses, second call (after delete) returns only one
      vi.mocked(addressesApi.getDeliveryAddresses)
        .mockResolvedValueOnce(mockDeliveryAddresses)
        .mockResolvedValueOnce([mockDeliveryAddresses[0]]);

      render(<ProfileContent />);

      // Wait for data to be loaded
      await waitFor(() => {
        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(screen.getByText("Trabajo")).toBeInTheDocument();
      });

      // Find all delete buttons by aria-label and click the first one
      const deleteButtons = screen.getAllByLabelText("Delete");
      expect(deleteButtons.length).toBe(2); // 2 delivery addresses
      await user.click(deleteButtons[0]);

      // Wait for dialog to appear and find the confirm button by text
      await waitFor(() => {
        expect(screen.getByText("Delete address?")).toBeInTheDocument();
        expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
      });

      // Find the "Delete" button inside the dialog by getting all buttons and filtering
      const allButtons = screen.getAllByRole("button");
      const deleteTextButtons = allButtons.filter((btn) => btn.textContent === "Delete");

      // The last one should be the confirm button in the dialog
      await user.click(deleteTextButtons[deleteTextButtons.length - 1]);

      await waitFor(() => {
        expect(addressesApi.deleteDeliveryAddress).toHaveBeenCalledWith("delivery-123");
        expect(addressesApi.getDeliveryAddresses).toHaveBeenCalledTimes(2); // Initial load + after delete
      });
    });
  });
});
