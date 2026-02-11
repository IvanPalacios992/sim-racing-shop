"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export type FilterValues = {
  search: string;
  minPrice: string;
  maxPrice: string;
  isCustomizable: boolean;
  sortBy: string;
  sortDescending: boolean;
};

type ProductFiltersProps = {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
};

const SORT_OPTIONS = [
  { value: "", descending: false, key: "featured" },
  { value: "BasePrice", descending: false, key: "priceLow" },
  { value: "BasePrice", descending: true, key: "priceHigh" },
  { value: "CreatedAt", descending: true, key: "newest" },
  { value: "Name", descending: false, key: "name" },
] as const;

export function ProductFilters({ filters, onFiltersChange }: Readonly<ProductFiltersProps>) {
  const t = useTranslations("products");
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = (partial: Partial<FilterValues>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const clearFilters = useCallback(() => {
    onFiltersChange({
      search: "",
      minPrice: "",
      maxPrice: "",
      isCustomizable: false,
      sortBy: "",
      sortDescending: false,
    });
  }, [onFiltersChange]);

  const currentSortKey = SORT_OPTIONS.find(
    (o) => o.value === filters.sortBy && o.descending === filters.sortDescending
  )?.key ?? "featured";

  const hasActiveFilters =
    filters.search ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.isCustomizable;

  const filtersContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-silver" />
          <Input
            type="text"
            placeholder={t("search")}
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            className="border-graphite bg-obsidian pl-10 text-white placeholder:text-silver"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">{t("sortBy")}</h3>
        <select
          value={`${currentSortKey}`}
          onChange={(e) => {
            const option = SORT_OPTIONS.find((o) => o.key === e.target.value);
            if (option) {
              updateFilter({
                sortBy: option.value,
                sortDescending: option.descending,
              });
            }
          }}
          className="w-full rounded-lg border border-graphite bg-obsidian px-3 py-2 text-sm text-white"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {t(`sortOptions.${option.key}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">{t("priceRange")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder={t("minPrice")}
            value={filters.minPrice}
            onChange={(e) => updateFilter({ minPrice: e.target.value })}
            className="border-graphite bg-obsidian text-white placeholder:text-silver"
            min={0}
          />
          <Input
            type="number"
            placeholder={t("maxPrice")}
            value={filters.maxPrice}
            onChange={(e) => updateFilter({ maxPrice: e.target.value })}
            className="border-graphite bg-obsidian text-white placeholder:text-silver"
            min={0}
          />
        </div>
      </div>

      {/* Customizable */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="customizable"
          checked={filters.isCustomizable}
          onCheckedChange={(checked) =>
            updateFilter({ isCustomizable: checked === true })
          }
        />
        <label htmlFor="customizable" className="cursor-pointer text-sm text-silver">
          {t("customizable")}
        </label>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-electric-blue hover:text-electric-blue/80"
        >
          {t("clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="border-graphite text-white"
        >
          <SlidersHorizontal className="mr-2 size-4" />
          {t("filters")}
          {hasActiveFilters && (
            <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-racing-red text-[10px] text-white">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-obsidian/80"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMobileOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
          />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-carbon p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t("filters")}</h2>
              <button onClick={() => setMobileOpen(false)} className="text-silver hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            {filtersContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] shrink-0 rounded-xl bg-carbon p-6 lg:block">
        <h2 className="mb-6 text-lg font-semibold text-white">{t("filters")}</h2>
        {filtersContent}
      </aside>
    </>
  );
}
