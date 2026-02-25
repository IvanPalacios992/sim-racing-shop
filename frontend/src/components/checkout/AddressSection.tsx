"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import AddressFormModal from "./AddressFormModal";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto, CreateDeliveryAddressDto, UpdateDeliveryAddressDto } from "@/types/addresses";

type  Props = {
  billingAddress: BillingAddressDetailDto | null;
  deliveryAddresses: DeliveryAddressDetailDto[];
  selectedDeliveryId: string | null;
  onSelectDelivery: (id: string) => void;
  onAddDelivery: (dto: CreateDeliveryAddressDto) => Promise<void>;
  onEditDelivery: (id: string, dto: UpdateDeliveryAddressDto) => Promise<void>;
  onDeleteDelivery: (id: string) => Promise<void>;
}

export default function AddressSection({
  billingAddress,
  deliveryAddresses,
  selectedDeliveryId,
  onSelectDelivery,
  onAddDelivery,
  onEditDelivery,
  onDeleteDelivery,
}: Props) {
  const t = useTranslations("Checkout");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressDetailDto | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEdit = (addr: DeliveryAddressDetailDto) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSave = async (dto: CreateDeliveryAddressDto | UpdateDeliveryAddressDto) => {
    if (editingAddress) {
      await onEditDelivery(editingAddress.id, dto as UpdateDeliveryAddressDto);
    } else {
      await onAddDelivery(dto as CreateDeliveryAddressDto);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1 — Billing address */}
      <section className="rounded-xl bg-carbon p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-racing-red text-sm font-bold text-white">
            {t("step1")}
          </span>
          <h2 className="text-xl font-semibold text-white">{t("billingAddress")}</h2>
        </div>

        {billingAddress ? (
          <div className="rounded-lg border border-graphite bg-obsidian p-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 flex-shrink-0 text-silver" />
              <div className="space-y-0.5 text-silver">
                <p className="font-medium text-white">{billingAddress.street}</p>
                <p>
                  {billingAddress.city}
                  {billingAddress.state ? `, ${billingAddress.state}` : ""}
                </p>
                <p>
                  {billingAddress.postalCode} — {billingAddress.country}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Link
                href="/perfil"
                className="text-xs text-electric-blue hover:underline"
              >
                {t("editInProfile")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-graphite bg-obsidian p-4 text-sm text-silver">
            <p>{t("noBillingAddress")}</p>
            <Link href="/perfil" className="mt-2 inline-block text-xs text-electric-blue hover:underline">
              {t("editInProfile")}
            </Link>
          </div>
        )}
      </section>

      {/* Step 2 — Delivery address */}
      <section className="rounded-xl bg-carbon p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-racing-red text-sm font-bold text-white">
            {t("step2")}
          </span>
          <h2 className="text-xl font-semibold text-white">{t("shippingAddress")}</h2>
        </div>

        <div className="space-y-3">
          {deliveryAddresses.map((addr) => {
            const isSelected = addr.id === selectedDeliveryId;
            return (
              <div
                key={addr.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDelivery(addr.id)}
                onKeyDown={(e) => e.key === "Enter" && onSelectDelivery(addr.id)}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? "border-racing-red bg-racing-red/5"
                    : "border-graphite bg-obsidian hover:border-silver/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? "border-racing-red" : "border-graphite"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-racing-red" />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-white">{addr.name}</p>
                      <p className="text-silver">{addr.street}</p>
                      <p className="text-silver">
                        {addr.city}
                        {addr.state ? `, ${addr.state}` : ""}
                      </p>
                      <p className="text-silver">
                        {addr.postalCode} — {addr.country}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="none"
                  >
                    {confirmDeleteId === addr.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-silver">¿Eliminar?</span>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            onDeleteDelivery(addr.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Sí
                        </Button>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(addr)}
                          className="p-1 text-silver transition-colors hover:text-electric-blue"
                          aria-label={t("editAddress")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(addr.id)}
                          className="p-1 text-silver transition-colors hover:text-racing-red"
                          aria-label={t("deleteAddress")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openAdd}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addDeliveryAddress")}
          </Button>
        </div>
      </section>

      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingAddress}
      />
    </div>
  );
}
