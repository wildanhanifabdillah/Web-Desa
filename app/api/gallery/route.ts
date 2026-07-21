import { listGalleryAlbumRecords } from "@/lib/gallery-store";

export async function GET(request: Request) {
  const albums = await listGalleryAlbumRecords();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim().toLowerCase();
  const limitValue = searchParams.get("limit");
  const limit = limitValue ? Number.parseInt(limitValue, 10) : null;

  const filteredAlbums = category
    ? albums.filter((album) => album.category.toLowerCase() === category)
    : albums;
  const limitedAlbums = limit && Number.isFinite(limit) && limit > 0
    ? filteredAlbums.slice(0, limit)
    : filteredAlbums;

  return Response.json({
    data: limitedAlbums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      category: album.category,
      description: album.description,
      coverImage: album.coverImage,
      photoCount: album.photoCount,
      updatedAt: album.updatedAt,
    })),
    meta: {
      total: limitedAlbums.length,
      available: filteredAlbums.length,
      category: category ?? null,
      limit,
    },
  });
}
