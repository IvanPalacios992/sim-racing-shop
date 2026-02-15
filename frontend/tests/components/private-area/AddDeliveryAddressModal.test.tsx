import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import AddDeliveryAddressModal from "@/components/private-area/AddDeliveryAddressModal";
import type { DeliveryAddressDetailDto } from "@/types/addresses";
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

describe("AddDeliveryAddressModal", () => {
  const userId = "user-123";
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering - create mode", () => {
    it("does not render when isOpen is false", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.queryByText("New Delivery Address")).not.toBeInTheDocument();
    });

    it("renders with create title when editAddress is null", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByText("New Delivery Address")).toBeInTheDocument();
    });

    it("renders all form fields including name", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByLabelText("Address name *")).toBeInTheDocument();
      expect(screen.getByLabelText("Street *")).toBeInTheDocument();
      expect(screen.getByLabelText("City *")).toBeInTheDocument();
      expect(screen.getByLabelText("State/Province *")).toBeInTheDocument();
      expect(screen.getByLabelText("Postal Code *")).toBeInTheDocument();
      expect(screen.getByLabelText("Country *")).toBeInTheDocument();
    });

    it("renders set as default checkbox", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByText("Set as default")).toBeInTheDocument();
    });

    it("renders empty form fields in create mode", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      expect(screen.getByLabelText("Address name *")).toHaveValue("");
      expect(screen.getByLabelText("Street *")).toHaveValue("");
      expect(screen.getByLabelText("City *")).toHaveValue("");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("");
      expect(screen.getByLabelText("Country *")).toHaveValue("");
    });

    it("checkbox is unchecked by default", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("rendering - edit mode", () => {
    const editAddress: DeliveryAddressDetailDto = {
      id: "delivery-123",
      userId: "user-123",
      name: "Casa",
      street: "123 Main Street",
      city: "Madrid",
      state: "Madrid",
      postalCode: "28001",
      country: "España",
      isDefault: true,
    };

    it("renders with edit title when editAddress is provided", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      expect(screen.getByText("Edit Delivery Address")).toBeInTheDocument();
    });

    it("populates form with existing address data", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      expect(screen.getByLabelText("Address name *")).toHaveValue("Casa");
      expect(screen.getByLabelText("Street *")).toHaveValue("123 Main Street");
      expect(screen.getByLabelText("City *")).toHaveValue("Madrid");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("Madrid");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("28001");
      expect(screen.getByLabelText("Country *")).toHaveValue("España");
    });

    it("checkbox is checked when address is default", () => {
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("checkbox is unchecked when address is not default", () => {
      const nonDefaultAddress = { ...editAddress, isDefault: false };
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={nonDefaultAddress}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("interactions", () => {
    it("calls onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddDeliveryAddressModal
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

    it("allows toggling the default checkbox", async () => {
      const user = userEvent.setup();
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("allows editing all form fields", async () => {
      const user = userEvent.setup();
      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Address name *"), "Trabajo");
      await user.type(screen.getByLabelText("Street *"), "456 Oak Avenue");
      await user.type(screen.getByLabelText("City *"), "Barcelona");
      await user.type(screen.getByLabelText("State/Province *"), "Catalunya");
      await user.type(screen.getByLabelText("Postal Code *"), "08001");
      await user.type(screen.getByLabelText("Country *"), "Spain");

      expect(screen.getByLabelText("Address name *")).toHaveValue("Trabajo");
      expect(screen.getByLabelText("Street *")).toHaveValue("456 Oak Avenue");
      expect(screen.getByLabelText("City *")).toHaveValue("Barcelona");
      expect(screen.getByLabelText("State/Province *")).toHaveValue("Catalunya");
      expect(screen.getByLabelText("Postal Code *")).toHaveValue("08001");
      expect(screen.getByLabelText("Country *")).toHaveValue("Spain");
    });
  });

  describe("form submission - create mode", () => {
    it("creates delivery address with provided data", async () => {
      const user = userEvent.setup();
      const newAddress: DeliveryAddressDetailDto = {
        id: "delivery-new",
        userId,
        name: "Trabajo",
        street: "456 Oak Avenue",
        city: "Barcelona",
        state: "Catalunya",
        postalCode: "08001",
        country: "Spain",
        isDefault: true,
      };

      vi.mocked(addressesApi.createDeliveryAddress).mockResolvedValue(newAddress);

      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      // Fill form
      await user.type(screen.getByLabelText("Address name *"), "Trabajo");
      await user.type(screen.getByLabelText("Street *"), "456 Oak Avenue");
      await user.type(screen.getByLabelText("City *"), "Barcelona");
      await user.type(screen.getByLabelText("State/Province *"), "Catalunya");
      await user.type(screen.getByLabelText("Postal Code *"), "08001");
      await user.type(screen.getByLabelText("Country *"), "Spain");
      await user.click(screen.getByRole("checkbox"));

      // Submit
      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addressesApi.createDeliveryAddress).toHaveBeenCalledWith({
          userId,
          name: "Trabajo",
          street: "456 Oak Avenue",
          city: "Barcelona",
          state: "Catalunya",
          postalCode: "08001",
          country: "Spain",
          isDefault: true,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("creates address with isDefault false when checkbox is unchecked", async () => {
      const user = userEvent.setup();
      vi.mocked(addressesApi.createDeliveryAddress).mockResolvedValue({} as any);

      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Address name *"), "Casa");
      await user.type(screen.getByLabelText("Street *"), "Test Street");
      await user.type(screen.getByLabelText("City *"), "Test City");
      await user.type(screen.getByLabelText("State/Province *"), "Test State");
      await user.type(screen.getByLabelText("Postal Code *"), "12345");
      await user.type(screen.getByLabelText("Country *"), "Test Country");

      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addressesApi.createDeliveryAddress).toHaveBeenCalledWith(
          expect.objectContaining({
            isDefault: false,
          })
        );
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

      vi.mocked(addressesApi.createDeliveryAddress).mockRejectedValue(errorResponse);

      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={null}
        />
      );

      await user.type(screen.getByLabelText("Address name *"), "Test");
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
    const editAddress: DeliveryAddressDetailDto = {
      id: "delivery-123",
      userId: "user-123",
      name: "Casa",
      street: "123 Main Street",
      city: "Madrid",
      state: "Madrid",
      postalCode: "28001",
      country: "España",
      isDefault: false,
    };

    it("updates delivery address with modified data", async () => {
      const user = userEvent.setup();
      const updatedAddress: DeliveryAddressDetailDto = {
        ...editAddress,
        street: "789 New Street",
        isDefault: true,
      };

      vi.mocked(addressesApi.updateDeliveryAddress).mockResolvedValue(updatedAddress);

      render(
        <AddDeliveryAddressModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          userId={userId}
          editAddress={editAddress}
        />
      );

      // Modify street and check isDefault
      const streetInput = screen.getByLabelText("Street *");
      await user.clear(streetInput);
      await user.type(streetInput, "789 New Street");
      await user.click(screen.getByRole("checkbox"));

      // Submit
      const saveButton = screen.getByRole("button", { name: "Save" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addressesApi.updateDeliveryAddress).toHaveBeenCalledWith(
          "delivery-123",
          {
            name: "Casa",
            street: "789 New Street",
            city: "Madrid",
            state: "Madrid",
            postalCode: "28001",
            country: "España",
            isDefault: true,
          }
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
