import { getPublicNews } from "@/lib/public-news";

export async function GET() {
  const news = (await getPublicNews()).slice(0, 3);

  return Response.json({
    data: news,
  });
}
