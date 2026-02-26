"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { VideoModal } from "./VideoModal";

export function HeroSection() {
  const t = useTranslations("home");
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian to-carbon" />

      {/* Radial pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(/main.webp)",
          backgroundRepeat:
            "no-repeat",
          backgroundSize:
            "cover"
        }}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-obsidian/90 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-[900px] px-8">
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-widest text-white md:text-5xl lg:text-[56px]">
          {t("hero.title")}
        </h1>
        <p className="mb-12 text-lg text-silver">
          {t("tagline")}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Button
            asChild
            className="h-14 rounded-lg bg-racing-red px-8 text-base font-semibold text-white transition-all hover:bg-racing-red/80 hover:shadow-[0_0_20px_rgba(229,57,53,0.4)]"
          >
            <Link href="/productos">{t("hero.cta")}</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setVideoOpen(true)}
            className="h-14 rounded-lg border-white bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10"
          >
            {t("hero.ctaSecondary")}
          </Button>
        </div>
      </div>

      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" style={{ animation: "bounce-slow 2s infinite" }}>
        <ChevronDown className="size-8 text-silver" />
      </div>
    </section>
  );
}
