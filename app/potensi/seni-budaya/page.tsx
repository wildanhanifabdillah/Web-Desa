import { ArtCulturePage } from "@/components/art-culture-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { ArtGroupRecord, ArtTypeRecord } from "@/lib/art-culture-store";

type ArtCulturePayload = {
  types: ArtTypeRecord[];
  groups: Array<ArtGroupRecord & { artTypes: ArtTypeRecord[] }>;
};

export default async function SeniBudayaPage() {
  const { data } = await fetchPublicApi<ApiResponse<ArtCulturePayload>>("/api/potentials/art-culture");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <ArtCulturePage types={data.types} groups={data.groups} />
    </div>
  );
}