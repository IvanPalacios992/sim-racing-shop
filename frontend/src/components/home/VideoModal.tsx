"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

const VIDEOS = [
  "UOL0ZeH6Re0",
  "UEuZG37gFdM",
  "WAvN0EzEacU",
  "tiTtgq2Pcow",
  "OSMCfPASImQ",
];

function getRandomVideo(exclude?: string): string {
  const available = exclude ? VIDEOS.filter((id) => id !== exclude) : VIDEOS;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return available[array[0] % available.length];
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const t = useTranslations("home.videoModal");
  const [videoId, setVideoId] = useState<string>(() => getRandomVideo());

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <div
        className="bg-carbon border border-graphite rounded-lg w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-graphite">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-racing-red/20 px-3 py-1 text-xs font-bold tracking-widest text-racing-red">
              {t("badge")}
            </span>
            <h2 className="text-lg font-bold text-pure-white">{t("title")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-silver hover:text-electric-blue transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Description */}
        <p className="px-6 pt-4 pb-2 text-sm text-silver">{t("description")}</p>

        {/* Video */}
        <div className="px-6 pb-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-obsidian">
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setVideoId((prev) => getRandomVideo(prev))}
              className="flex items-center gap-2 text-sm text-silver hover:text-electric-blue transition-colors cursor-pointer"
            >
              <RefreshCw className="size-4" />
              {t("nextVideo")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
