import { NewsPage } from "@/components/news-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PublicNewsItem } from "@/lib/public-news";

export default async function BeritaPage() {
  const { data: news } = await fetchPublicApi<ApiResponse<PublicNewsItem[]>>("/api/news");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <NewsPage initialNews={news} />
    </div>
  );
}
