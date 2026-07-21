import { notFound } from "next/navigation";
import { GalleryAlbumDetailPage } from "@/components/gallery-album-detail-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { GalleryAlbum } from "@/lib/gallery";

export default async function GaleriAlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [albumResponse, albumsResponse] = await Promise.all([
    fetchPublicApi<ApiResponse<GalleryAlbum>>(`/api/gallery/${slug}`).catch(() => null),
    fetchPublicApi<ApiResponse<GalleryAlbum[]>>("/api/gallery"),
  ]);

  if (!albumResponse) {
    notFound();
  }

  const relatedAlbums = albumsResponse.data
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <GalleryAlbumDetailPage album={albumResponse.data} relatedAlbums={relatedAlbums} />
    </div>
  );
}
