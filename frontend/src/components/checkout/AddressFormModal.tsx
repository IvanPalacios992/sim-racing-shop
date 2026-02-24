"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DeliveryAddressDetailDto, CreateDeliveryAddressDto, UpdateDeliveryAddressDto } from "@/types/addresses";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateDeliveryAddressDto | UpdateDeliveryAddressDto) => Promise<void>;
  initial?: DeliveryAddressDetailDto | null;
}

export default function AddressFormModal({ isOpen, onClose, onSave, initial }: Props) {
  const t = useTranslations("Checkout");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    street: initial?.street ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    country: initial?.country ?? "ES",
    postalCode: initial?.postalCode ?? "",
    isDefault: initial?.isDefault ?? false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form as CreateDeliveryAddressDto | UpdateDeliveryAddressDto);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? t("editAddress") : t("addDeliveryAddress")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="addr-name" className="text-xs text-silver">
            {t("addressName")} *
          </Label>
          <Input
            id="addr-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Ej: Casa, Oficina..."
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="addr-street" className="text-xs text-silver">
            {t("street")} *
          </Label>
          <Input
            id="addr-street"
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
            required
            placeholder="Calle Mayor 1, 2ºA"
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="addr-city" className="text-xs text-silver">
              {t("city")} *
            </Label>
            <Input
              id="addr-city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              required
              placeholder="Madrid"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="addr-state" className="text-xs text-silver">
              {t("state")}
            </Label>
            <Input
              id="addr-state"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="Madrid"
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="addr-postal" className="text-xs text-silver">
              {t("postalCode")} *
            </Label>
            <Input
              id="addr-postal"
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              required
              placeholder="28001"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="addr-country" className="text-xs text-silver">
              {t("country")} *
            </Label>
            <Input
              id="addr-country"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              required
              placeholder="ES"
              className="text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="accent-racing-red"
          />
          <span className="text-sm text-silver">{t("isDefault")}</span>
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "..." : t("saveAddress")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
