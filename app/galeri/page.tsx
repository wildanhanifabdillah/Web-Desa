import { GalleryPage } from "@/components/gallery-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { GalleryAlbum } from "@/lib/gallery";

export default async function GaleriPage() {
  const albumsResponse = await fetchPublicApi<ApiResponse<GalleryAlbum[]>>("/api/gallery");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <GalleryPage albums={albumsResponse.data} />
    </div>
  );
}
