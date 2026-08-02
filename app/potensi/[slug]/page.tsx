import { notFound } from "next/navigation";
import { PotentialDetailPage } from "@/components/potential-detail-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PotentialCategory } from "@/lib/potential-categories";

type PotensiDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PotensiDetailPageRoute({ params }: PotensiDetailPageProps) {
  const { slug } = await params;
  const categoriesResponse = await fetchPublicApi<ApiResponse<PotentialCategory[]>>("/api/potentials/categories");
  const categories = categoriesResponse.data;
  const categoryIndex = categories.findIndex((item) => item.slug === slug);

  if (categoryIndex < 0 || categories.length === 0) {
    notFound();
  }

  const category = categories[categoryIndex];
  const previousCategory = categories[(categoryIndex - 1 + categories.length) % categories.length];
  const nextCategory = categories[(categoryIndex + 1) % categories.length];
  const relatedCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <PotentialDetailPage
        category={category}
        previousCategory={previousCategory}
        nextCategory={nextCategory}
        relatedCategories={relatedCategories}
      />
    </div>
  );
}