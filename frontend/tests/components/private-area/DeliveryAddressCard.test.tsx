import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../helpers/render";
import DeliveryAddressCard from "@/components/private-area/DeliveryAddressCard";
import type { DeliveryAddressDetailDto } from "@/types/addresses";

describe("DeliveryAddressCard", () => {
  const mockAddress: DeliveryAddressDetailDto = {
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

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders address name", () => {
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Casa")).toBeInTheDocument();
    });

    it("renders all address fields", () => {
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("123 Main Street")).toBeInTheDocument();
      expect(screen.getByText("28001 Madrid, Madrid")).toBeInTheDocument();
      expect(screen.getByText("España")).toBeInTheDocument();
    });

    it("shows default badge when isDefault is true", () => {
      const defaultAddress = { ...mockAddress, isDefault: true };
      render(
        <DeliveryAddressCard
          address={defaultAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("does not show default badge when isDefault is false", () => {
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText("Default")).not.toBeInTheDocument();
    });

    it("renders edit and delete buttons", () => {
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2); // Edit and Delete buttons
    });
  });

  describe("interactions", () => {
    it("calls onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getAllByRole("button");
      const editButton = buttons[0]; // First button is edit
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it("shows confirmation dialog when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons[1]; // Second button is delete
      await user.click(deleteButton);

      expect(screen.getByText("Delete address?")).toBeInTheDocument();
      expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("calls onDelete when confirm button is clicked in dialog", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click delete button to show confirmation
      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons[1];
      await user.click(deleteButton);

      // Click confirm in dialog - there are now 2 "Delete" buttons (card button + dialog button)
      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      const confirmButton = deleteButtons[1]; // Second one is the confirm button in dialog
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call onDelete when cancel button is clicked in dialog", async () => {
      const user = userEvent.setup();
      render(
        <DeliveryAddressCard
          address={mockAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click delete button to show confirmation
      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons[1];
      await user.click(deleteButton);

      // Click cancel in dialog
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(screen.queryByText("Delete address?")).not.toBeInTheDocument();
    });
  });

  describe("different address values", () => {
    it("renders work address", () => {
      const workAddress: DeliveryAddressDetailDto = {
        id: "delivery-456",
        userId: "user-456",
        name: "Trabajo",
        street: "456 Business Park",
        city: "Barcelona",
        state: "Catalunya",
        postalCode: "08001",
        country: "Spain",
        isDefault: true,
      };

      render(
        <DeliveryAddressCard
          address={workAddress}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Trabajo")).toBeInTheDocument();
      expect(screen.getByText("456 Business Park")).toBeInTheDocument();
      expect(screen.getByText("Default")).toBeInTheDocument();
    });
  });
});
