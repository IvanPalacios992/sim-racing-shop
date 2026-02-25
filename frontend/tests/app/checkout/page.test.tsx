import React from "react";
import { render, screen } from "../../helpers/render";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { resetAuthStore, createMockAuthResponse } from "../../helpers/auth-store";
import { resetCartStore, emptyMockCart } from "../../helpers/cart";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/addresses", () => ({
  addressesApi: {
    getBillingAddress: vi.fn().mockResolvedValue(null),
    getDeliveryAddresses: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/api/orders", () => ({
  ordersApi: { createOrder: vi.fn() },
}));

vi.mock("@/lib/api/shipping", () => ({
  shippingApi: { calculate: vi.fn() },
}));

import CheckoutPage from "@/app/[locale]/checkout/page";

describe("CheckoutPage", () => {
  beforeEach(() => {
    resetAuthStore();
    resetCartStore();
    vi.clearAllMocks();
  });

  it("renders the checkout page (hydrating state)", () => {
    useAuthStore.setState({ _hasHydrated: false });
    useCartStore.setState({ _hasHydrated: false });

    render(<CheckoutPage />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("renders empty cart state when cart is empty and user is authenticated", () => {
    useAuthStore.getState().setAuth(createMockAuthResponse());
    useAuthStore.setState({ _hasHydrated: true });
    useCartStore.setState({ cart: emptyMockCart(), _hasHydrated: true });

    render(<CheckoutPage />);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });
});
