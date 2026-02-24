"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { addressesApi } from "@/lib/api/addresses";
import { ordersApi } from "@/lib/api/orders";
import { shippingApi } from "@/lib/api/shipping";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentMethodSection, { type PaymentMethod } from "@/components/checkout/PaymentMethodSection";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto, CreateDeliveryAddressDto, UpdateDeliveryAddressDto } from "@/types/addresses";
import type { ShippingCalculationDto } from "@/types/shipping";

export default function CheckoutContent() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();

  const { isAuthenticated, _hasHydrated: authHydrated, user } = useAuthStore();
  const { cart, _hasHydrated: cartHydrated, clearCart } = useCartStore();

  const [billingAddress, setBillingAddress] = useState<BillingAddressDetailDto | null>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddressDetailDto[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [shipping, setShipping] = useState<ShippingCalculationDto | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authHydrated) return;
    if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    if (!isAuthenticated) {
      authTimeoutRef.current = setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 300);
    }
    return () => {
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
  }, [isAuthenticated, authHydrated, router, locale]);

  // Load addresses
  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;
    setLoadingAddresses(true);
    Promise.all([
      addressesApi.getBillingAddress(),
      addressesApi.getDeliveryAddresses(),
    ])
      .then(([billing, delivery]) => {
        setBillingAddress(billing);
        setDeliveryAddresses(delivery);
        // Auto-select default or first
        const defaultAddr = delivery.find((a) => a.isDefault) ?? delivery[0];
        if (defaultAddr) setSelectedDeliveryId(defaultAddr.id);
      })
      .catch(() => setAddressError("Error al cargar las direcciones"))
      .finally(() => setLoadingAddresses(false));
  }, [authHydrated, isAuthenticated]);

  // Calculate shipping when delivery address changes
  useEffect(() => {
    if (!selectedDeliveryId || !cart) return;
    const addr = deliveryAddresses.find((a) => a.id === selectedDeliveryId);
    if (!addr) return;
    setShippingLoading(true);
    setShipping(null);
    shippingApi
      .calculate({ postalCode: addr.postalCode, subtotal: cart.total, weightKg: 0 })
      .then(setShipping)
      .catch(() => setShipping(null))
      .finally(() => setShippingLoading(false));
  }, [selectedDeliveryId, deliveryAddresses, cart]);

  const handleAddDelivery = async (dto: CreateDeliveryAddressDto) => {
    const created = await addressesApi.createDeliveryAddress({
      ...dto,
      userId: user?.id ?? "",
    });
    setDeliveryAddresses((prev) => [...prev, created]);
    if (!selectedDeliveryId || created.isDefault) {
      setSelectedDeliveryId(created.id);
    }
  };

  const handleEditDelivery = async (id: string, dto: UpdateDeliveryAddressDto) => {
    const updated = await addressesApi.updateDeliveryAddress(id, dto);
    setDeliveryAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const handleDeleteDelivery = async (id: string) => {
    await addressesApi.deleteDeliveryAddress(id);
    setDeliveryAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedDeliveryId === id) {
      const remaining = deliveryAddresses.filter((a) => a.id !== id);
      setSelectedDeliveryId(remaining[0]?.id ?? null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || !selectedDeliveryId) {
      setPlaceOrderError(t("selectDeliveryFirst"));
      return;
    }
    const addr = deliveryAddresses.find((a) => a.id === selectedDeliveryId);
    if (!addr) {
      setPlaceOrderError(t("selectDeliveryFirst"));
      return;
    }

    setPlacing(true);
    setPlaceOrderError(null);

    const shippingCost = shipping
      ? shipping.isFreeShipping
        ? 0
        : shipping.totalCost
      : 0;

    // Build order items with correct prices matching backend's validation model:
    // backend calculates unitPrice = BasePrice * (1 + VatRate/100) (WITH VAT)
    // cart stores unitPrice = BasePrice (WITHOUT VAT) and subtotal = BasePrice * qty
    const orderItemsList = cart.items.map((item) => {
      const vatMultiplier = 1 + item.vatRate / 100;
      const unitPrice = Math.round(item.unitPrice * vatMultiplier * 100) / 100;
      const lineTotal = Math.round(item.subtotal * vatMultiplier * 100) / 100;
      return {
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        quantity: item.quantity,
        unitPrice,                    // WITH VAT (= BasePrice * 1.21)
        unitSubtotal: item.unitPrice, // WITHOUT VAT (= BasePrice)
        lineTotal,                    // WITH VAT (= unitPrice * qty)
        lineSubtotal: item.subtotal,  // WITHOUT VAT (= BasePrice * qty)
      };
    });

    // Order-level totals: backend accumulates sum(lineTotal WITH VAT) as subtotal
    const subtotal = Math.round(orderItemsList.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
    const vatAmount = Math.round(subtotal * 0.21 * 100) / 100;
    const totalAmount = Math.round((subtotal + vatAmount + shippingCost) * 100) / 100;

    try {
      const order = await ordersApi.createOrder({
        shippingStreet: addr.street,
        shippingCity: addr.city,
        shippingState: addr.state || null,
        shippingPostalCode: addr.postalCode,
        shippingCountry: addr.country,
        subtotal,
        vatAmount,
        shippingCost,
        totalAmount,
        orderItems: orderItemsList,
      });

      await clearCart();
      router.push(`/${locale}/pedidos/${order.id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setPlaceOrderError(message ?? t("errorPlacingOrder"));
    } finally {
      setPlacing(false);
    }
  };

  // Show loading while hydrating
  if (!authHydrated || !cartHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian">
        <div className="text-silver">Cargando...</div>
      </div>
    );
  }

  // Redirect loading for unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian">
        <div className="text-silver">Verificando autenticación...</div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-obsidian">
        <div className="mx-auto max-w-[900px] px-6 py-24 text-center">
          <ShoppingCart className="mx-auto mb-6 size-20 text-silver" />
          <h2 className="mb-3 text-2xl font-bold text-white">{t("cartEmpty")}</h2>
          <p className="mb-8 text-silver">{t("cartEmptyMessage")}</p>
          <Link
            href="/productos"
            className="rounded-lg bg-racing-red px-8 py-3 font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-silver">
          <Link href="/" className="transition-colors hover:text-white">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/carrito" className="transition-colors hover:text-white">
            Carrito
          </Link>
          <span>/</span>
          <span className="text-white">{t("breadcrumbCheckout")}</span>
        </nav>

        <h1 className="mb-10 text-4xl font-bold text-white">{t("title")}</h1>

        {addressError && (
          <div className="mb-6 rounded-lg border border-error bg-error/10 px-4 py-3 text-sm text-error">
            {addressError}
          </div>
        )}

        {loadingAddresses ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-carbon" />
              ))}
            </div>
            <div className="h-[500px] animate-pulse rounded-xl bg-carbon" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Left: address + payment */}
            <div className="space-y-6">
              <AddressSection
                billingAddress={billingAddress}
                deliveryAddresses={deliveryAddresses}
                selectedDeliveryId={selectedDeliveryId}
                onSelectDelivery={setSelectedDeliveryId}
                onAddDelivery={handleAddDelivery}
                onEditDelivery={handleEditDelivery}
                onDeleteDelivery={handleDeleteDelivery}
              />
              <PaymentMethodSection
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            {/* Right: order summary */}
            <CheckoutOrderSummary
              cart={cart}
              shipping={shipping}
              shippingLoading={shippingLoading}
              placing={placing}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onPlaceOrder={handlePlaceOrder}
              error={placeOrderError}
            />
          </div>
        )}
      </div>
    </main>
  );
}
