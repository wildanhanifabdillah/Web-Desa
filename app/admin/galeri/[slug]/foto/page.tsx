import { notFound } from "next/navigation";
import { AdminGalleryPhotosPage } from "@/components/admin-gallery-photos-page";
import { getGalleryAlbumRecord } from "@/lib/gallery-store";

export const dynamic = "force-dynamic";
export default async function AdminGaleriFotoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getGalleryAlbumRecord(slug);

  if (!album) {
    notFound();
  }

  return <AdminGalleryPhotosPage album={album} />;
}
