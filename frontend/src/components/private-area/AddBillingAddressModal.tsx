"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addressesApi } from "@/lib/api/addresses";
import type { CreateBillingAddressDto, UpdateBillingAddressDto, BillingAddressDetailDto } from "@/types/addresses";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

interface AddBillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  editAddress?: BillingAddressDetailDto | null;
}

export default function AddBillingAddressModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  editAddress,
}: AddBillingAddressModalProps) {
  const t = useTranslations("Profile.addresses");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const isEditMode = !!editAddress;

  useEffect(() => {
    if (editAddress) {
      setFormData({
        street: editAddress.street,
        city: editAddress.city,
        state: editAddress.state,
        postalCode: editAddress.postalCode,
        country: editAddress.country,
      });
    } else {
      setFormData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
    }
    setError(null);
  }, [editAddress, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        const dto: UpdateBillingAddressDto = formData;
        await addressesApi.updateBillingAddress(dto);
      } else {
        const dto: CreateBillingAddressDto = {
          userId,
          ...formData,
        };
        await addressesApi.createBillingAddress(dto);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} billing address:`, err);
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || t(isEditMode ? "errorUpdating" : "errorCreating"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("editBillingAddressTitle") : t("addBillingAddressTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}

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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
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
