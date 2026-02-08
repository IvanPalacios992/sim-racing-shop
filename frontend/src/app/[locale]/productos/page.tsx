import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ProductsPageContent } from "./ProductsPageContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
