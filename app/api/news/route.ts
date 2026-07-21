import { searchPublicNews } from "@/lib/public-news";
import { parseNewsSearchParams } from "@/lib/news-search-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const validation = parseNewsSearchParams(searchParams);

  if (!validation.ok) {
    return Response.json(
      {
        error: "Parameter daftar berita tidak valid.",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  const result = await searchPublicNews(validation.params);

  return Response.json({
    data: result.data,
    meta: {
      total: result.total,
      available: result.available,
      query: result.query,
      category: result.category,
      limit: result.limit,
    },
  });
}
