"use client";

import { useTranslations } from "next-intl";

interface Props {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({ value, onIncrease, onDecrease, min = 1, max = 99, disabled }: Props) {
  const t = useTranslations("Cart");
  return (
    <div className="flex items-center gap-2 bg-graphite rounded-md">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || value <= min}
        aria-label={t("decrease")}
        className="flex size-8 items-center justify-center font-bold text-white cursor-pointer transition-colors hover:border-electric-blue hover:text-electric-blue disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || value >= max}
        aria-label={t("increase")}
        className="flex size-8 items-center justify-center font-bold text-white cursor-pointer transition-colors hover:border-electric-blue hover:text-electric-blue disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
