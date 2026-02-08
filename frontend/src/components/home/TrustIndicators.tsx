"use client";

import { useTranslations } from "next-intl";
import { Truck, ShieldCheck, Lock, Headphones } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, titleKey: "shipping", descKey: "shippingDesc" },
  { icon: ShieldCheck, titleKey: "warranty", descKey: "warrantyDesc" },
  { icon: Lock, titleKey: "payment", descKey: "paymentDesc" },
  { icon: Headphones, titleKey: "support", descKey: "supportDesc" },
] as const;

export function TrustIndicators() {
  const t = useTranslations("home.trust");

  return (
    <section className="bg-obsidian px-6 py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="text-center">
            <Icon className="mx-auto mb-6 size-12 text-silver" strokeWidth={1.5} />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {t(titleKey)}
            </h3>
            <p className="text-sm text-silver">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
