import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { TransparencyDetailPage } from "@/components/transparency-detail-page";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { TransparencyDocument } from "@/lib/transparency";

export default async function TransparansiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [documentResponse, documentsResponse] = await Promise.all([
    fetchPublicApi<ApiResponse<TransparencyDocument>>(`/api/transparency/${slug}`).catch(() => null),
    fetchPublicApi<ApiResponse<TransparencyDocument[]>>("/api/transparency"),
  ]);

  if (!documentResponse) {
    notFound();
  }

  const relatedDocuments = documentsResponse.data
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <TransparencyDetailPage
        document={documentResponse.data}
        relatedDocuments={relatedDocuments}
      />
    </div>
  );
}
