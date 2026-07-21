import { listGalleryVideoRecords } from "@/lib/gallery-store";

export async function GET(request: Request) {
  const videos = await listGalleryVideoRecords();
  const { searchParams } = new URL(request.url);
  const limitValue = searchParams.get("limit");
  const limit = limitValue ? Number.parseInt(limitValue, 10) : null;
  const limitedVideos = limit && Number.isFinite(limit) && limit > 0
    ? videos.slice(0, limit)
    : videos;

  return Response.json({
    data: limitedVideos,
    meta: {
      total: limitedVideos.length,
      available: videos.length,
      limit,
    },
  });
}
