import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto } from "@/types/addresses";
import AddressSection from "@/components/checkout/AddressSection";

function createBilling(): BillingAddressDetailDto {
  return {
    id: "billing-1",
    street: "Gran Via 10",
    city: "Madrid",
    state: "Madrid",
    country: "ES",
    postalCode: "28001",
  };
}

function createDelivery(overrides?: Partial<DeliveryAddressDetailDto>): DeliveryAddressDetailDto {
  return {
    id: "delivery-1",
    name: "Home",
    street: "Calle Mayor 1",
    city: "Madrid",
    state: "Madrid",
    country: "ES",
    postalCode: "28001",
    isDefault: true,
    ...overrides,
  };
}

const defaultProps = {
  billingAddress: createBilling(),
  deliveryAddresses: [createDelivery()],
  selectedDeliveryId: "delivery-1",
  onSelectDelivery: vi.fn(),
  onAddDelivery: vi.fn(),
  onEditDelivery: vi.fn(),
  onDeleteDelivery: vi.fn(),
};

describe("AddressSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── billing address ────────────────────────────────────────────────────────

  describe("billing address", () => {
    it("renders billing address street when present", () => {
      render(<AddressSection {...defaultProps} />);
      expect(screen.getByText("Gran Via 10")).toBeInTheDocument();
    });

    it("renders billing address city and postal code", () => {
      render(<AddressSection {...defaultProps} />);
      // city and state are rendered in the same <p> — use regex to avoid exact-match issues
      expect(screen.getAllByText(/Madrid/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/28001/).length).toBeGreaterThan(0);
    });

    it("shows no-billing message when billing address is null", () => {
      render(<AddressSection {...defaultProps} billingAddress={null} />);
      expect(
        screen.getByText("You don't have a billing address configured.")
      ).toBeInTheDocument();
    });

    it("shows 'edit in profile' link when billing address is null", () => {
      render(<AddressSection {...defaultProps} billingAddress={null} />);
      const links = screen.getAllByRole("link", { name: "Edit in your profile" });
      expect(links.length).toBeGreaterThan(0);
    });
  });

  // ── delivery addresses ─────────────────────────────────────────────────────

  describe("delivery addresses", () => {
    it("renders each delivery address name", () => {
      const addresses = [
        createDelivery({ id: "d-1", name: "Home" }),
        createDelivery({ id: "d-2", name: "Work" }),
      ];
      render(<AddressSection {...defaultProps} deliveryAddresses={addresses} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Work")).toBeInTheDocument();
    });

    it("calls onSelectDelivery with the address id when clicking an address", async () => {
      const onSelectDelivery = vi.fn();
      const user = userEvent.setup();
      const addresses = [
        createDelivery({ id: "d-1", name: "Home" }),
        createDelivery({ id: "d-2", name: "Office", isDefault: false }),
      ];

      render(
        <AddressSection
          {...defaultProps}
          deliveryAddresses={addresses}
          selectedDeliveryId="d-1"
          onSelectDelivery={onSelectDelivery}
        />
      );

      await user.click(screen.getByText("Office"));

      expect(onSelectDelivery).toHaveBeenCalledWith("d-2");
    });

    it("shows the 'Add new address' button", () => {
      render(<AddressSection {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /Add new address/i })
      ).toBeInTheDocument();
    });

    it("renders section headings for billing and shipping", () => {
      render(<AddressSection {...defaultProps} />);
      expect(screen.getByText("Billing Address")).toBeInTheDocument();
      expect(screen.getByText("Shipping Address")).toBeInTheDocument();
    });
  });

  // ── add address modal ──────────────────────────────────────────────────────

  describe("add address modal", () => {
    it("opens the modal when 'Add new address' is clicked", async () => {
      const user = userEvent.setup();
      render(<AddressSection {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /Add new address/i }));

      // The modal contains a unique "Save address" button not present before opening
      expect(screen.getByRole("button", { name: "Save address" })).toBeInTheDocument();
    });
  });

  // ── edit/delete ────────────────────────────────────────────────────────────

  describe("edit and delete buttons", () => {
    it("renders edit button for each delivery address", () => {
      render(<AddressSection {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });

    it("renders delete button for each delivery address", () => {
      render(<AddressSection {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });
  });
});
