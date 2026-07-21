import { notFound } from "next/navigation";
import { NewsDetailPage } from "@/components/news-detail-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PublicNewsItem } from "@/lib/public-news";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [newsResponse, listResponse] = await Promise.all([
    fetchPublicApi<ApiResponse<PublicNewsItem>>(`/api/news/${slug}`).catch(() => null),
    fetchPublicApi<ApiResponse<PublicNewsItem[]>>("/api/news"),
  ]);

  if (!newsResponse) {
    notFound();
  }

  const relatedNews = listResponse.data
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <NewsDetailPage initialNews={newsResponse.data} relatedNews={relatedNews} />
    </div>
  );
}
