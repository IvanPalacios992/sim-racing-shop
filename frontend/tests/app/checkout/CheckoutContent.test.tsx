import React from "react";
import { render, screen, waitFor, act } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { resetCartStore, createMockCart, createMockCartItem, emptyMockCart } from "../../helpers/cart";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto } from "@/types/addresses";
import type { ShippingCalculationDto } from "@/types/shipping";
import type { OrderDetailDto } from "@/types/orders";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api/addresses", () => ({
  addressesApi: {
    getBillingAddress: vi.fn(),
    getDeliveryAddresses: vi.fn(),
    createDeliveryAddress: vi.fn(),
    updateDeliveryAddress: vi.fn(),
    deleteDeliveryAddress: vi.fn(),
  },
}));

vi.mock("@/lib/api/orders", () => ({
  ordersApi: {
    createOrder: vi.fn(),
  },
}));

vi.mock("@/lib/api/shipping", () => ({
  shippingApi: {
    calculate: vi.fn(),
  },
}));

import { addressesApi } from "@/lib/api/addresses";
import { ordersApi } from "@/lib/api/orders";
import { shippingApi } from "@/lib/api/shipping";
import CheckoutContent from "@/app/[locale]/checkout/CheckoutContent";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockBillingAddress(): BillingAddressDetailDto {
  return {
    id: "billing-1",
    street: "Calle Mayor 1",
    city: "Madrid",
    state: "Madrid",
    country: "ES",
    postalCode: "28001",
  };
}

function createMockDeliveryAddress(
  overrides?: Partial<DeliveryAddressDetailDto>
): DeliveryAddressDetailDto {
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

function createMockShipping(
  overrides?: Partial<ShippingCalculationDto>
): ShippingCalculationDto {
  return {
    zoneName: "Peninsular",
    baseCost: 6.25,
    weightCost: 0,
    totalCost: 6.25,
    weightKg: 0,
    isFreeShipping: false,
    freeShippingThreshold: 100,
    subtotalNeededForFreeShipping: 0,
    ...overrides,
  };
}

function createMockOrderDetail(): OrderDetailDto {
  return {
    id: "order-abc",
    orderNumber: "ORD-20260225-0001",
    userId: "user-123",
    shippingStreet: "Calle Mayor 1",
    shippingCity: "Madrid",
    shippingState: "Madrid",
    shippingPostalCode: "28001",
    shippingCountry: "ES",
    paymentId: null,
    subtotal: 349.99,
    vatAmount: 73.5,
    shippingCost: 6.25,
    totalAmount: 429.74,
    orderStatus: "pending",
    estimatedProductionDays: 7,
    productionNotes: null,
    trackingNumber: null,
    shippedAt: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderItems: [],
  };
}

function setupAuthenticatedUser() {
  useAuthStore.getState().setAuth(createMockAuthResponse());
  useAuthStore.setState({ _hasHydrated: true });
}

function setupHydratedCart() {
  useCartStore.setState({ cart: createMockCart(), _hasHydrated: true });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("CheckoutContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthStore();
    resetCartStore();

    // Default: addresses load successfully with one delivery address
    vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(
      createMockBillingAddress()
    );
    vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue([
      createMockDeliveryAddress(),
    ]);
    vi.mocked(shippingApi.calculate).mockResolvedValue(createMockShipping());
  });

  // ── Hydrating state ─────────────────────────────────────────────────────

  describe("hydrating state", () => {
    it("shows loading while auth store is not hydrated", () => {
      useAuthStore.setState({ _hasHydrated: false });
      useCartStore.setState({ _hasHydrated: true });

      render(<CheckoutContent />);

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    it("shows loading while cart store is not hydrated", () => {
      setupAuthenticatedUser();
      useCartStore.setState({ _hasHydrated: false });

      render(<CheckoutContent />);

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });
  });

  // ── Unauthenticated redirect ─────────────────────────────────────────────

  describe("unauthenticated redirect", () => {
    it("shows verification message when not authenticated", () => {
      useAuthStore.setState({ _hasHydrated: true, isAuthenticated: false });
      setupHydratedCart();

      render(<CheckoutContent />);

      expect(
        screen.getByText("Verificando autenticación...")
      ).toBeInTheDocument();
    });

    it("redirects to login after 300ms when not authenticated", async () => {
      vi.useFakeTimers();
      useAuthStore.setState({ _hasHydrated: true, isAuthenticated: false });
      setupHydratedCart();

      render(<CheckoutContent />);

      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockPush).toHaveBeenCalledWith("/en/login");

      vi.useRealTimers();
    });
  });

  // ── Empty cart ───────────────────────────────────────────────────────────

  describe("empty cart", () => {
    it("shows empty cart message when cart has no items", () => {
      setupAuthenticatedUser();
      useCartStore.setState({ cart: emptyMockCart(), _hasHydrated: true });

      render(<CheckoutContent />);

      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    it("shows continue shopping link when cart is empty", () => {
      setupAuthenticatedUser();
      useCartStore.setState({ cart: emptyMockCart(), _hasHydrated: true });

      render(<CheckoutContent />);

      expect(
        screen.getByRole("link", { name: "Explore products" })
      ).toBeInTheDocument();
    });
  });

  // ── Loading addresses ────────────────────────────────────────────────────

  describe("loading addresses", () => {
    it("shows address loading skeleton while API is pending", () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      vi.mocked(addressesApi.getBillingAddress).mockImplementation(
        () => new Promise(() => {})
      );
      vi.mocked(addressesApi.getDeliveryAddresses).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<CheckoutContent />);

      expect(
        container.querySelectorAll(".animate-pulse").length
      ).toBeGreaterThan(0);
    });
  });

  // ── Addresses loaded ─────────────────────────────────────────────────────

  describe("addresses loaded", () => {
    it("renders page title after loading", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { level: 1 })
        ).toHaveTextContent("Checkout");
      });
    });

    it("renders billing address street after loading", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      vi.mocked(addressesApi.getBillingAddress).mockResolvedValue({
        ...createMockBillingAddress(),
        street: "Gran Via 10",
      });

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("Gran Via 10")).toBeInTheDocument();
      });
    });

    it("renders delivery address name after loading", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("Home")).toBeInTheDocument();
      });
    });

    it("shows 'no billing address' message when billing address is null", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      vi.mocked(addressesApi.getBillingAddress).mockResolvedValue(null);

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(
          screen.getByText("You don't have a billing address configured.")
        ).toBeInTheDocument();
      });
    });

    it("shows address error message when API fails", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      vi.mocked(addressesApi.getBillingAddress).mockRejectedValue(
        new Error("Network error")
      );

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(
          screen.getByText("Error al cargar las direcciones")
        ).toBeInTheDocument();
      });
    });

    it("renders order summary section", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("Order Summary")).toBeInTheDocument();
      });
    });

    it("renders product name in order summary", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("Formula Steering Wheel")).toBeInTheDocument();
      });
    });

    it("renders PLACE ORDER button", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument();
      });
    });
  });

  // ── Auto-selection of delivery address ──────────────────────────────────

  describe("delivery address auto-selection", () => {
    it("auto-selects the default delivery address on load", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      const defaultAddr = createMockDeliveryAddress({
        id: "delivery-default",
        name: "Work",
        isDefault: true,
      });
      const otherAddr = createMockDeliveryAddress({
        id: "delivery-other",
        name: "Home",
        isDefault: false,
      });
      vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue([
        otherAddr,
        defaultAddr,
      ]);

      render(<CheckoutContent />);

      // Shipping is calculated for the default address, not the first
      await waitFor(() => {
        expect(shippingApi.calculate).toHaveBeenCalledWith(
          expect.objectContaining({ postalCode: defaultAddr.postalCode })
        );
      });
    });

    it("auto-selects the first delivery address when none is default", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      const first = createMockDeliveryAddress({
        id: "delivery-first",
        name: "First",
        postalCode: "28001",
        isDefault: false,
      });
      const second = createMockDeliveryAddress({
        id: "delivery-second",
        name: "Second",
        postalCode: "08001",
        isDefault: false,
      });
      vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue([
        first,
        second,
      ]);

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(shippingApi.calculate).toHaveBeenCalledWith(
          expect.objectContaining({ postalCode: "28001" })
        );
      });
    });
  });

  // ── Shipping calculation ─────────────────────────────────────────────────

  describe("shipping calculation", () => {
    it("calls shippingApi.calculate with correct postal code and subtotal", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(shippingApi.calculate).toHaveBeenCalledWith({
          postalCode: "28001",
          subtotal: 349.99,
          weightKg: 0,
        });
      });
    });

    it("shows shipping calculating text while loading", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      vi.mocked(shippingApi.calculate).mockImplementation(
        () => new Promise(() => {})
      );

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("Calculating...")).toBeInTheDocument();
      });
    });

    it("shows shipping cost after calculation", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("€6.25")).toBeInTheDocument();
      });
    });

    it("shows FREE when shipping is free", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      vi.mocked(shippingApi.calculate).mockResolvedValue(
        createMockShipping({ isFreeShipping: true, totalCost: 0 })
      );

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(screen.getByText("FREE")).toBeInTheDocument();
      });
    });
  });

  // ── PLACE ORDER button state ─────────────────────────────────────────────

  describe("PLACE ORDER button state", () => {
    it("is disabled when terms are not accepted", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();

      render(<CheckoutContent />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeDisabled();
      });
    });

    it("is enabled after accepting terms", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      const user = userEvent.setup();

      render(<CheckoutContent />);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument()
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(
        screen.getByRole("button", { name: /place order/i })
      ).not.toBeDisabled();
    });
  });

  // ── Placing order ────────────────────────────────────────────────────────

  describe("placing order", () => {
    async function setupAndAcceptTerms() {
      setupAuthenticatedUser();
      setupHydratedCart();
      const user = userEvent.setup();

      vi.mocked(ordersApi.createOrder).mockResolvedValue(
        createMockOrderDetail()
      );

      render(<CheckoutContent />);

      // Wait for addresses to load
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument()
      );

      // Accept terms
      await user.click(screen.getByRole("checkbox"));

      return user;
    }

    it("calls ordersApi.createOrder when PLACE ORDER is clicked", async () => {
      const user = await setupAndAcceptTerms();

      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalledTimes(1);
      });
    });

    it("sends correct shipping address in order", async () => {
      const user = await setupAndAcceptTerms();

      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            shippingStreet: "Calle Mayor 1",
            shippingCity: "Madrid",
            shippingPostalCode: "28001",
            shippingCountry: "ES",
          })
        );
      });
    });

    it("sends correct order items with VAT-inclusive unit prices", async () => {
      const user = await setupAndAcceptTerms();

      await user.click(screen.getByRole("button", { name: /place order/i }));

      // item: unitPrice=349.99, vatRate=21 → unitPriceWithVat = 349.99 * 1.21 = 423.49
      await waitFor(() => {
        expect(ordersApi.createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            orderItems: expect.arrayContaining([
              expect.objectContaining({
                productId: "product-123",
                unitSubtotal: 349.99,
                unitPrice: 423.49,
              }),
            ]),
          })
        );
      });
    });

    it("redirects to order detail page after successful order", async () => {
      const user = await setupAndAcceptTerms();

      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/en/pedidos/order-abc");
      });
    });

    it("shows error message when order creation fails", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      const user = userEvent.setup();

      vi.mocked(ordersApi.createOrder).mockRejectedValue({
        response: { data: { message: "Stock insuficiente" } },
      });

      render(<CheckoutContent />);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument()
      );

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(screen.getByText("Stock insuficiente")).toBeInTheDocument();
      });
    });

    it("shows generic error message when server error has no message", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      const user = userEvent.setup();

      vi.mocked(ordersApi.createOrder).mockRejectedValue(new Error("Network"));

      render(<CheckoutContent />);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument()
      );

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Error placing your order. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("shows selectDeliveryFirst error when no delivery address is selected", async () => {
      setupAuthenticatedUser();
      setupHydratedCart();
      const user = userEvent.setup();

      // No delivery addresses → no address auto-selected
      vi.mocked(addressesApi.getDeliveryAddresses).mockResolvedValue([]);

      render(<CheckoutContent />);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /place order/i })
        ).toBeInTheDocument()
      );

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /place order/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Please select a shipping address")
        ).toBeInTheDocument();
      });
    });
  });
});
