import { SiteHeader } from "@/components/site-header";
import { TransparencyPage } from "@/components/transparency-page";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { TransparencyDocument } from "@/lib/transparency";

export default async function TransparansiPage() {
  const { data: documents } = await fetchPublicApi<ApiResponse<TransparencyDocument[]>>("/api/transparency");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <TransparencyPage documents={documents} />
    </div>
  );
}
