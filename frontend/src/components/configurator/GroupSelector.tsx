"use client";

import Image from "next/image";
import { Check, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomizationGroup, CustomizationOption } from "@/types/products";

interface GroupSelectorProps {
  group: CustomizationGroup;
  selectedId: string | null;
  onChange: (componentId: string | null) => void;
}

interface OptionCardProps {
  option: CustomizationOption;
  isSelected: boolean;
  onSelect: () => void;
}

function OptionCard({ option, isSelected, onSelect }: OptionCardProps) {
  const t = useTranslations("productDetail.configurator");

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!option.inStock}
      aria-pressed={isSelected}
      className={`
        relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center
        transition-all duration-150
        ${isSelected
          ? "border-racing-red bg-racing-red/10 ring-2 ring-racing-red/30"
          : "border-graphite bg-carbon hover:border-silver"
        }
        ${!option.inStock ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
      `}
    >
      {/* Thumbnail o placeholder */}
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-graphite">
        {option.thumbnailUrl ? (
          <Image
            src={option.thumbnailUrl}
            alt={option.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <Package className="size-7 text-silver" />
        )}
        {/* Checkmark cuando seleccionado */}
        {isSelected && (
          <div className="absolute bottom-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-racing-red">
            <Check className="size-2.5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Nombre */}
      <span className={`text-xs font-medium leading-tight ${isSelected ? "text-white" : "text-silver"}`}>
        {option.name}
      </span>

      {/* Modificador de precio */}
      {option.priceModifier != 0 && (
        <span className="text-[10px] font-semibold text-electric-blue">
          {option.priceModifier.toFixed(2)}€
        </span>
      )}

      {/* Badge sin stock */}
      {!option.inStock && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-graphite px-2 py-0.5 text-[10px] text-silver">
          {t("outOfStock")}
        </span>
      )}
    </button>
  );
}

export function GroupSelector({ group, selectedId, onChange }: GroupSelectorProps) {
  const t = useTranslations("productDetail.configurator");

  return (
    <section className="flex flex-col gap-3">
      {/* Cabecera del grupo */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          {group.name}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            group.isRequired
              ? "bg-racing-red/20 text-racing-red"
              : "bg-graphite text-silver"
          }`}
        >
          {group.isRequired ? t("required") : t("optional")}
        </span>
      </div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {/* Card "Ninguno" solo si el grupo no es requerido */}
        {!group.isRequired && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-pressed={selectedId === null}
            className={`
              flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center
              transition-all duration-150
              ${selectedId === null
                ? "border-racing-red bg-racing-red/10 ring-2 ring-racing-red/30"
                : "border-graphite bg-carbon hover:border-silver"
              }
            `}
          >
            <div className="flex size-16 items-center justify-center rounded-lg bg-graphite">
              <span className="text-lg text-silver">∅</span>
            </div>
            <span className={`text-xs font-medium leading-tight ${selectedId === null ? "text-white" : "text-silver"}`}>
              {t("none")}
            </span>
          </button>
        )}

        {group.options.map((option) => (
          <OptionCard
            key={option.componentId}
            option={option}
            isSelected={selectedId === option.componentId}
            onSelect={() => onChange(option.componentId)}
          />
        ))}
      </div>
    </section>
  );
}
