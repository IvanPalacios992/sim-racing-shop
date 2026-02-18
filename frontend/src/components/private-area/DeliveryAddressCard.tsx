import { useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DeliveryAddressDetailDto } from "@/types/addresses";
import { Button } from "../ui/button";

interface DeliveryAddressCardProps {
  address: DeliveryAddressDetailDto;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DeliveryAddressCard({ address, onEdit, onDelete }: DeliveryAddressCardProps) {
  const t = useTranslations("Profile.addresses");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="border-2 border-graphite rounded-lg p-4 hover:border-electric-blue transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <MapPin className="w-5 h-5 text-racing-red mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-pure-white font-medium">
                  {address.name}
                </span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 bg-champagne-gold text-obsidian-black rounded-full text-xs font-bold uppercase">
                    {t("default")}
                  </span>
                )}
              </div>
              <div className="text-silver text-sm space-y-1">
                <div>{address.street}</div>
                <div>
                  {address.postalCode} {address.city}, {address.state}
                </div>
                <div>{address.country}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-silver hover:text-electric-blue transition-colors p-1"
              title={t("edit")}
              aria-label={t("edit")}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-silver hover:text-error transition-colors p-1"
              title={t("delete")}
              aria-label={t("delete")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-carbon border border-graphite rounded-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-pure-white mb-3">
              {t("confirmDelete")}
            </h3>
            <p className="text-silver mb-6">
              {t("confirmDeleteMessage")}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="secondary"
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1"
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
