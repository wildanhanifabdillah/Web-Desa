import { getPublicNewsBySlug } from "@/lib/public-news";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const news = await getPublicNewsBySlug(slug);

  if (!news) {
    return Response.json(
      {
        error: "Berita tidak ditemukan.",
        message: "Berita tidak ditemukan",
      },
      { status: 404 },
    );
  }

  return Response.json({
    data: news,
    meta: {
      slug,
    },
  });
}
