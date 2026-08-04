import { getFallbackSiteSettings, getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings().catch(() => getFallbackSiteSettings());

  return Response.json({ data: settings });
}