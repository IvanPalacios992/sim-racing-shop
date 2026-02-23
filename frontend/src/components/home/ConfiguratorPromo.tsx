"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const FEATURE_KEYS = ["feature1", "feature2", "feature3", "feature4"] as const;

export function ConfiguratorPromo() {
  const t = useTranslations("home.configurator");

  return (
    <section className="grid min-h-screen bg-obsidian lg:grid-cols-[3fr_2fr]">
      {/* Visual side */}
      <div className="relative flex items-center justify-center overflow-hidden bg-carbon p-8 lg:p-16">
        {/* Rotating circle placeholder */}
        <div
          className="flex aspect-square w-full max-w-[500px] items-center justify-center rounded-full bg-gradient-to-br from-graphite to-carbon"
          style={{ animation: "spin-slow 20s linear infinite" }}
        >
          <span className="text-[120px] font-bold text-white/5">3D</span>
        </div>
      </div>

      {/* Content side */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
        <span className="mb-8 inline-block w-fit rounded-full bg-champagne px-4 py-2 text-xs font-bold tracking-wider text-obsidian">
          {t("badge")}
        </span>

        <h2 className="mb-6 text-3xl font-semibold text-white lg:text-4xl">
          {t("title")}
        </h2>

        <p className="mb-8 text-lg text-silver">
          {t("description")}
        </p>

        <ul className="mb-12 space-y-0">
          {FEATURE_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-center gap-4 border-b border-graphite py-4 text-white"
            >
              <Check className="size-5 shrink-0 text-success" strokeWidth={3} />
              {t(key)}
            </li>
          ))}
        </ul>

        <Button
          className="h-14 w-fit rounded-lg bg-racing-red px-8 text-base font-semibold text-white transition-all hover:bg-racing-red/80 hover:shadow-[0_0_20px_rgba(229,57,53,0.4)]"
        >
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
