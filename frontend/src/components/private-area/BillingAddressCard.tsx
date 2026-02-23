import { MapPin, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BillingAddressDetailDto } from "@/types/addresses";

interface BillingAddressCardProps {
  address: BillingAddressDetailDto;
  onEdit: () => void;
}

export default function BillingAddressCard({ address, onEdit }: BillingAddressCardProps) {
  const t = useTranslations("Profile.addresses");

  return (
    <div className="border-2 border-graphite rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <MapPin className="w-5 h-5 text-racing-red mt-1" />
          <div className="flex-1">
            <div className="text-pure-white font-medium mb-2">
              {t("billingAddress")}
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
        <button
          onClick={onEdit}
          className="text-silver hover:text-electric-blue transition-colors p-1"
          title={t("edit")}
          aria-label={t("edit")}
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
