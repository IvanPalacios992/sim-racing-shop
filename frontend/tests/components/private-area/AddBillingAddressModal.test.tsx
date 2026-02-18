import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import AddBillingAddressModal from "@/components/private-area/AddBillingAddressModal";
import type { BillingAddressDetailDto } from "@/types/addresses";
import { AxiosError, AxiosHeaders } from "axios";

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

import { addressesApi } from "@/lib/api/addresses";

describe("AddBillingAddressModal", () => {
  const userId = "user-123";
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering - create mode", () => {
    it("does not render when isOpen is false", () => {
      render(
        <AddBillingAddressModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.queryByText("New Billing Address")).not.toBeInTheDocument();
    });

    it("renders with create title when editAddress is null", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByText("New Billing Address")).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByLabelText("Street *")).toBeInTheDocument();
      expect(screen.getByLabelText("City *")).toBeInTheDocument();
      expect(screen.getByLabelText("State/Province *")).toBeInTheDocument();
      expect(screen.getByLabelText("Postal Code *")).toBeInTheDocument();
      expect(screen.getByLabelText("Country *")).toBeInTheDocument();
    });

    it("renders empty form fields in create mode", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByLabelText("Street *")).toHaveValue("");
      expect(screen.getByLabelText("City *")).toHaveValue("");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("");
      expect(screen.getByLabelText("Country *")).toHaveValue("");
    });

    it("renders cancel and save buttons", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  describe("rendering - edit mode", () => {
    const editAddress: BillingAddressDetailDto = {
      id: "billing-123",
      userId: "user-123",
      street: "123 Main Street",
      city: "Madrid",
      state: "Madrid",
      postalCode: "28001",
      country: "España",
    };

    it("renders with edit title when editAddress is provided", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      expect(screen.getByText("Edit Billing Address")).toBeInTheDocument();
    });

    it("populates form with existing address data", () => {
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      expect(screen.getByLabelText("Street *")).toHaveValue("123 Main Street");
      expect(screen.getByLabelText("City *")).toHaveValue("Madrid");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("Madrid");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("28001");
      expect(screen.getByLabelText("Country *")).toHaveValue("España");
    });
  });

  describe("interactions", () => {
    it("calls onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close button in header is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      const closeButton = screen.getByLabelText("Close modal");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("allows editing all form fields", async () => {
      const user = userEvent.setup();
      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Street *"), "456 Oak Avenue");
      await user.type(screen.getByLabelText("City *"), "Barcelona");
      await user.type(screen.getByLabelText("State/Province *"), "Catalunya");
      await user.type(screen.getByLabelText("Postal Code *"), "08001");
      await user.type(screen.getByLabelText("Country *"), "Spain");

      expect(screen.getByLabelText("Street *")).toHaveValue("456 Oak Avenue");
      expect(screen.getByLabelText("City *")).toHaveValue("Barcelona");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("Catalunya");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("08001");
      expect(screen.getByLabelText("Country *")).toHaveValue("Spain");
    });
  });

  describe("form submission - create mode", () => {
    it("creates billing address with provided data", async () => {
      const user = userEvent.setup();
      const newAddress: BillingAddressDetailDto = {
        id: "billing-new",
        userId,
        street: "456 Oak Avenue",
        city: "Barcelona",
        state: "Catalunya",
        postalCode: "08001",
        country: "Spain",
      };

      vi.mocked(addressesApi.createBillingAddress).mockResolvedValue(newAddress);

      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      // Fill form
      await user.type(screen.getByLabelText("Street *"), "456 Oak Avenue");
      await user.type(screen.getByLabelText("City *"), "Barcelona");
      await user.type(screen.getByLabelText("State/Province *"), "Catalunya");
      await user.type(screen.getByLabelText("Postal Code *"), "08001");
      await user.type(screen.getByLabelText("Country *"), "Spain");

      // Submit
      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addressesApi.createBillingAddress).toHaveBeenCalledWith({
          userId,
          street: "456 Oak Avenue",
          city: "Barcelona",
          state: "Catalunya",
          postalCode: "08001",
          country: "Spain",
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      vi.mocked(addressesApi.createBillingAddress).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as BillingAddressDetailDto), 100))
      );

      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Street *"), "Test Street");
      await user.type(screen.getByLabelText("City *"), "Test City");
      await user.type(screen.getByLabelText("State/Province *"), "Test State");
      await user.type(screen.getByLabelText("Postal Code *"), "12345");
      await user.type(screen.getByLabelText("Country *"), "Test Country");

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      expect(screen.getByRole("button", { name: "Saving..." })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      });
    });

    it("displays error message on submission failure", async () => {
      const user = userEvent.setup();
      const errorResponse = new AxiosError(
        "Creation failed",
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        {
          status: 400,
          data: { message: "Invalid address data" },
          statusText: "Bad Request",
          headers: {},
          config: { headers: new AxiosHeaders() },
        }
      );

      vi.mocked(addressesApi.createBillingAddress).mockRejectedValue(errorResponse);

      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Street *"), "Test Street");
      await user.type(screen.getByLabelText("City *"), "Test City");
      await user.type(screen.getByLabelText("State/Province *"), "Test State");
      await user.type(screen.getByLabelText("Postal Code *"), "12345");
      await user.type(screen.getByLabelText("Country *"), "Test Country");

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid address data")).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("form submission - edit mode", () => {
    const editAddress: BillingAddressDetailDto = {
      id: "billing-123",
      userId: "user-123",
      street: "123 Main Street",
      city: "Madrid",
      state: "Madrid",
      postalCode: "28001",
      country: "España",
    };

    it("updates billing address with modified data", async () => {
      const user = userEvent.setup();
      const updatedAddress: BillingAddressDetailDto = {
        ...editAddress,
        street: "789 New Street",
      };

      vi.mocked(addressesApi.updateBillingAddress).mockResolvedValue(updatedAddress);

      render(
        <AddBillingAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      // Modify street
      const streetInput = screen.getByLabelText("Street *");
      await user.clear(streetInput);
      await user.type(streetInput, "789 New Street");

      // Submit
      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addressesApi.updateBillingAddress).toHaveBeenCalledWith({
          street: "789 New Street",
          city: "Madrid",
          state: "Madrid",
          postalCode: "28001",
          country: "España",
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
