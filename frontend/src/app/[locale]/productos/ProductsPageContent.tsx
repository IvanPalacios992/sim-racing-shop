"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { productsApi } from "@/lib/api/products";
import { ProductGrid, ProductFilters, Pagination } from "@/components/products";
import type { FilterValues } from "@/components/products";
import type { ProductListItem, PaginatedResult } from "@/types/products";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

function parseSearchParams(searchParams: URLSearchParams): {
  filters: FilterValues;
  page: number;
} {
  return {
    filters: {
      search: searchParams.get("search") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      isCustomizable: searchParams.get("customizable") === "true",
      sortBy: searchParams.get("sortBy") ?? "",
      sortDescending: searchParams.get("sortDesc") === "true",
    },
    page: Number(searchParams.get("page")) || 1,
  };
}

function buildSearchParams(filters: FilterValues, page: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.isCustomizable) params.set("customizable", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDescending) params.set("sortDesc", "true");
  if (page > 1) params.set("page", String(page));
  const str = params.toString();
  return str ? `?${str}` : "";
}

export function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("products");

  const { filters: initialFilters, page: initialPage } =
    parseSearchParams(searchParams);

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<PaginatedResult<ProductListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer for search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(
    async (f: FilterValues, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await productsApi.getProducts({
          search: f.search || undefined,
          minPrice: f.minPrice ? Number(f.minPrice) : undefined,
          maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
          isCustomizable: f.isCustomizable || undefined,
          sortBy: f.sortBy || undefined,
          sortDescending: f.sortDescending || undefined,
          locale,
          page: p,
          pageSize: PAGE_SIZE,
        });
        setData(result);
      } catch {
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [locale, t]
  );

  // Update URL and fetch when filters/page change
  useEffect(() => {
    const qs = buildSearchParams(filters, page);
    router.replace(`${pathname}${qs}`, { scroll: false });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(filters, page);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, page, pathname, router, fetchProducts]);

  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="border-b border-graphite bg-carbon px-6 py-8">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-3xl font-semibold tracking-wider text-white md:text-4xl">
            {t("pageTitle")}
          </h1>
          {!loading && totalCount > 0 && (
            <p className="mt-2 text-sm text-silver">
              {t("showing", { from, to, total: totalCount })}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto flex max-w-[1400px] gap-8 px-6 py-8">
        {/* Filters */}
        <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertCircle className="mb-4 size-16 text-racing-red" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                {t("error")}
              </h3>
              <p className="mb-6 text-silver">{t("errorDesc")}</p>
              <Button
                onClick={() => fetchProducts(filters, page)}
                className="bg-racing-red text-white hover:bg-racing-red/80"
              >
                {t("retry")}
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={data?.items ?? []}
                loading={loading}
              />
              {!loading && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
