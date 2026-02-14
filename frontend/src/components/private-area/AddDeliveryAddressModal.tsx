"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addressesApi } from "@/lib/api/addresses";
import type { CreateDeliveryAddressDto, UpdateDeliveryAddressDto, DeliveryAddressDetailDto } from "@/types/addresses";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Modal from "@/components/ui/modal";

interface AddDeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  editAddress?: DeliveryAddressDetailDto | null;
}

export default function AddDeliveryAddressModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  editAddress,
}: AddDeliveryAddressModalProps) {
  const t = useTranslations("Profile.addresses");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  const isEditMode = !!editAddress;

  useEffect(() => {
    if (editAddress) {
      setFormData({
        name: editAddress.name,
        street: editAddress.street,
        city: editAddress.city,
        state: editAddress.state,
        postalCode: editAddress.postalCode,
        country: editAddress.country,
        isDefault: editAddress.isDefault,
      });
    } else {
      setFormData({
        name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isDefault: false,
      });
    }
    setError(null);
  }, [editAddress, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && editAddress) {
        const dto: UpdateDeliveryAddressDto = {
          name: formData.name,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          isDefault: formData.isDefault,
        };
        await addressesApi.updateDeliveryAddress(editAddress.id, dto);
      } else {
        const dto: CreateDeliveryAddressDto = {
          userId,
          ...formData,
        };
        await addressesApi.createDeliveryAddress(dto);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} delivery address:`, err);
      setError(err.response?.data?.message || t(isEditMode ? "errorUpdating" : "errorCreating"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDefault: checked,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("editDeliveryAddressTitle") : t("addDeliveryAddressTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("addressName")} *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t("addressNamePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">{t("street")} *</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              placeholder={t("streetPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t("postalCode")} *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                placeholder={t("postalCodePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("city")} *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder={t("cityPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">{t("state")} *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder={t("statePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t("country")} *</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder={t("countryPlaceholder")}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              {t("setAsDefault")}
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
