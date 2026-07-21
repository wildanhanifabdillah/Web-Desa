import { PotentialPage } from "@/components/potential-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PotentialCategory } from "@/lib/potential-categories";

export default async function PotensiPage() {
  const { data: categories } = await fetchPublicApi<ApiResponse<PotentialCategory[]>>("/api/potentials/categories");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <PotentialPage categories={categories} />
    </div>
  );
}
