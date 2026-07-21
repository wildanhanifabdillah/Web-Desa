import { DocumentsPage } from "@/components/documents-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { VillageRegulation } from "@/lib/village-regulations";

export default async function DokumenPage() {
  const { data: regulations } = await fetchPublicApi<ApiResponse<VillageRegulation[]>>("/api/documents");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <DocumentsPage regulations={regulations} />
    </div>
  );
}
