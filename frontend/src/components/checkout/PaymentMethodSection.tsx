"use client";

import { CreditCard, Wallet, Banknote, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

export type PaymentMethod = "card" | "paypal" | "klarna" | "transfer";

interface PaymentOption {
  id: PaymentMethod;
  icon: React.ReactNode;
  labelKey: string;
  descKey: string;
}

interface Props {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSection({ selected, onChange }: Props) {
  const t = useTranslations("Checkout");

  const options: PaymentOption[] = [
    {
      id: "card",
      icon: <CreditCard className="h-5 w-5" />,
      labelKey: "paymentCard",
      descKey: "paymentCardDesc",
    },
    {
      id: "paypal",
      icon: <Wallet className="h-5 w-5" />,
      labelKey: "paymentPaypal",
      descKey: "paymentPaypalDesc",
    },
    {
      id: "klarna",
      icon: <Banknote className="h-5 w-5" />,
      labelKey: "paymentKlarna",
      descKey: "paymentKlarnaDesc",
    },
    {
      id: "transfer",
      icon: <Building2 className="h-5 w-5" />,
      labelKey: "paymentTransfer",
      descKey: "paymentTransferDesc",
    },
  ];

  return (
    <section className="rounded-xl bg-carbon p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-racing-red text-sm font-bold text-white">
          {t("step3")}
        </span>
        <h2 className="text-xl font-semibold text-white">{t("paymentMethod")}</h2>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = opt.id === selected;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? "border-racing-red bg-racing-red/5"
                  : "border-graphite bg-obsidian hover:border-silver/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-racing-red" : "border-graphite"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-racing-red" />
                  )}
                </div>
                <span className={isSelected ? "text-racing-red" : "text-silver"}>
                  {opt.icon}
                </span>
                <div>
                  <p className="font-semibold text-white">{t(opt.labelKey as Parameters<typeof t>[0])}</p>
                  <p className="text-xs text-silver">{t(opt.descKey as Parameters<typeof t>[0])}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
