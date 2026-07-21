import { getActiveHomepageHeroBanner } from "@/lib/homepage-hero-banner";

export async function GET() {
  const banner = await getActiveHomepageHeroBanner();

  return Response.json({
    data: banner,
  });
}
