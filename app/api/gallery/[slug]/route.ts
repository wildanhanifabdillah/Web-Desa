import { getGalleryAlbumRecord } from "@/lib/gallery-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const album = await getGalleryAlbumRecord(slug);

  if (!album) {
    return Response.json(
      {
        error: "Album galeri tidak ditemukan.",
        message: "Album galeri tidak ditemukan",
      },
      { status: 404 },
    );
  }

  return Response.json({
    data: album,
    meta: {
      slug,
      photoCount: album.photos.length,
    },
  });
}
