"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Integrar con API de newsletter cuando esté disponible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success
    console.log("Newsletter subscription:", email);
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="relative px-8 py-24 overflow-hidden bg-gradient-to-br from-racing-red to-racing-red/80">
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-4xl font-semibold tracking-wide text-white">
          {t("title")}
        </h2>
        <p className="mb-8 text-lg text-white/90">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            disabled={isSubmitting}
            className="flex-1 pt-2 pb-2 border-none !bg-white text-obsidian placeholder:text-smoke focus-visible:ring-obsidian"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-racing-red hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting ? t("subscribing") : t("subscribe")}
          </Button>
        </form>

        <p className="mt-4 text-sm text-white/80">{t("privacy")}</p>
      </div>
    </section>
  );
}
