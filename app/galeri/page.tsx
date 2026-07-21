import { GalleryPage } from "@/components/gallery-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { GalleryAlbum, GalleryVideo } from "@/lib/gallery";

export default async function GaleriPage() {
  const [albumsResponse, videosResponse] = await Promise.all([
    fetchPublicApi<ApiResponse<GalleryAlbum[]>>("/api/gallery"),
    fetchPublicApi<ApiResponse<GalleryVideo[]>>("/api/gallery/videos"),
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <GalleryPage albums={albumsResponse.data} videos={videosResponse.data} />
    </div>
  );
}
