import { notFound } from "next/navigation";
import { PotentialDetailPage } from "@/components/potential-detail-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PotentialCategory } from "@/lib/potential-categories";

export default async function PotensiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categoryResponse, categoriesResponse] = await Promise.all([
    fetchPublicApi<ApiResponse<PotentialCategory>>(`/api/potentials/${slug}`).catch(() => null),
    fetchPublicApi<ApiResponse<PotentialCategory[]>>("/api/potentials/categories"),
  ]);

  if (!categoryResponse) {
    notFound();
  }

  const categories = categoriesResponse.data;
  const currentIndex = categories.findIndex((item) => item.slug === slug);
  const previousCategory = categories[
    currentIndex === 0 ? categories.length - 1 : currentIndex - 1
  ];
  const nextCategory = categories[
    currentIndex === categories.length - 1 ? 0 : currentIndex + 1
  ];
  const relatedCategories = categories.filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <PotentialDetailPage
        category={categoryResponse.data}
        nextCategory={nextCategory}
        previousCategory={previousCategory}
        relatedCategories={relatedCategories}
      />
    </div>
  );
}
