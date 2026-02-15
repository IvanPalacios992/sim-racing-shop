import userEvent from "@testing-library/user-event";
import { render, screen } from "../../helpers/render";
import BillingAddressCard from "@/components/private-area/BillingAddressCard";
import type { BillingAddressDetailDto } from "@/types/addresses";

describe("BillingAddressCard", () => {
  const mockAddress: BillingAddressDetailDto = {
    id: "billing-123",
    userId: "user-123",
    street: "123 Main Street",
    city: "Madrid",
    state: "Madrid",
    postalCode: "28001",
    country: "España",
  };

  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders all address fields", () => {
      render(<BillingAddressCard address={mockAddress} onEdit={mockOnEdit} />);

      expect(screen.getByText("123 Main Street")).toBeInTheDocument();
      expect(screen.getByText("28001 Madrid, Madrid")).toBeInTheDocument();
      expect(screen.getByText("España")).toBeInTheDocument();
    });

    it("renders edit button", () => {
      render(<BillingAddressCard address={mockAddress} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole("button");
      expect(editButton).toBeInTheDocument();
    });

    it("formats address correctly when all fields are provided", () => {
      render(<BillingAddressCard address={mockAddress} onEdit={mockOnEdit} />);

      // Street
      expect(screen.getByText("123 Main Street")).toBeInTheDocument();
      // Postal code, city and state
      expect(screen.getByText("28001 Madrid, Madrid")).toBeInTheDocument();
      // Country
      expect(screen.getByText("España")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<BillingAddressCard address={mockAddress} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole("button");
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it("edit button has hover effect classes", () => {
      render(<BillingAddressCard address={mockAddress} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole("button");
      expect(editButton).toHaveClass("hover:text-electric-blue");
    });
  });

  describe("different address values", () => {
    it("renders address with different values", () => {
      const differentAddress: BillingAddressDetailDto = {
        id: "billing-456",
        userId: "user-456",
        street: "456 Oak Avenue",
        city: "Barcelona",
        state: "Catalunya",
        postalCode: "08001",
        country: "Spain",
      };

      render(<BillingAddressCard address={differentAddress} onEdit={mockOnEdit} />);

      expect(screen.getByText("456 Oak Avenue")).toBeInTheDocument();
      expect(screen.getByText("08001 Barcelona, Catalunya")).toBeInTheDocument();
      expect(screen.getByText("Spain")).toBeInTheDocument();
    });
  });
});
