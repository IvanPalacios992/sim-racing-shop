"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api/auth";
import type { UpdateUserDto, UserDto } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: UserDto) => void;
  currentUser: UserDto;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: EditUserModalProps) {
  const t = useTranslations("Profile.personalInfo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        email: currentUser.email,
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
      });
    }
    setError(null);
  }, [currentUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dto: UpdateUserDto = {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      };
      const updatedUser = await authApi.updateUser(dto);
      onSuccess(updatedUser);
      onClose();
    } catch (err: unknown) {
      console.error("Error updating user:", err);
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || t("errorUpdating"));
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
    <Modal isOpen={isOpen} onClose={onClose} title={t("editTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")} *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t("emailPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={t("firstNamePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t("lastNamePlaceholder")}
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
