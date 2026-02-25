import React from "react";
import { render, screen, waitFor } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import type { DeliveryAddressDetailDto } from "@/types/addresses";
import AddressFormModal from "@/components/checkout/AddressFormModal";

function createInitialAddress(
  overrides?: Partial<DeliveryAddressDetailDto>
): DeliveryAddressDetailDto {
  return {
    id: "addr-1",
    name: "Home",
    street: "Calle Mayor 1",
    city: "Madrid",
    state: "Madrid",
    country: "ES",
    postalCode: "28001",
    isDefault: false,
    ...overrides,
  };
}

describe("AddressFormModal", () => {
  // ── visibility ─────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("does not render form content when isOpen is false", () => {
      render(
        <AddressFormModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />
      );
      expect(screen.queryByRole("form")).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Address alias/i)).not.toBeInTheDocument();
    });

    it("renders form content when isOpen is true", () => {
      render(
        <AddressFormModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
      );
      expect(screen.getByPlaceholderText("Ej: Casa, Oficina...")).toBeInTheDocument();
    });
  });

  // ── title ──────────────────────────────────────────────────────────────────

  describe("title", () => {
    it("shows 'Add new address' title when no initial address", () => {
      render(
        <AddressFormModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />
      );
      expect(screen.getByText("Add new address")).toBeInTheDocument();
    });

    it("shows 'Edit' title when initial address is provided", () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initial={createInitialAddress()}
        />
      );
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  // ── pre-fill ───────────────────────────────────────────────────────────────

  describe("pre-fill with initial values", () => {
    it("pre-fills name field", () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initial={createInitialAddress({ name: "Office" })}
        />
      );
      expect(screen.getByDisplayValue("Office")).toBeInTheDocument();
    });

    it("pre-fills street field", () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initial={createInitialAddress({ street: "Gran Via 10" })}
        />
      );
      expect(screen.getByDisplayValue("Gran Via 10")).toBeInTheDocument();
    });

    it("pre-fills city field", () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initial={createInitialAddress({ city: "Barcelona" })}
        />
      );
      expect(screen.getByDisplayValue("Barcelona")).toBeInTheDocument();
    });

    it("pre-fills postal code field", () => {
      render(
        <AddressFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
          initial={createInitialAddress({ postalCode: "08001" })}
        />
      );
      expect(screen.getByDisplayValue("08001")).toBeInTheDocument();
    });
  });

  // ── submission ─────────────────────────────────────────────────────────────

  describe("form submission", () => {
    it("calls onSave with form values when submitted", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <AddressFormModal isOpen={true} onClose={vi.fn()} onSave={onSave} />
      );

      await user.type(screen.getByPlaceholderText("Ej: Casa, Oficina..."), "Home");
      await user.type(screen.getByPlaceholderText("Calle Mayor 1, 2ºA"), "Gran Via 10");
      // Both city and state inputs share placeholder "Madrid" — target city (first occurrence)
      await user.type(screen.getAllByPlaceholderText("Madrid")[0], "Barcelona");
      await user.type(screen.getByPlaceholderText("28001"), "08001");

      await user.click(screen.getByRole("button", { name: "Save address" }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Home",
            street: "Gran Via 10",
            city: "Barcelona",
            postalCode: "08001",
          })
        );
      });
    });

    it("calls onClose after save resolves", async () => {
      const onClose = vi.fn();
      const onSave = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <AddressFormModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          initial={createInitialAddress()}
        />
      );

      await user.click(screen.getByRole("button", { name: "Save address" }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── cancel ─────────────────────────────────────────────────────────────────

  describe("cancel", () => {
    it("calls onClose when cancel button is clicked", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <AddressFormModal isOpen={true} onClose={onClose} onSave={vi.fn()} />
      );

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
