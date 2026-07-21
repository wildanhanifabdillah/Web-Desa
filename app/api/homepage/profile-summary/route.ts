import { getHomepageProfileSummary } from "@/lib/homepage-profile-summary";

export async function GET() {
  const summary = await getHomepageProfileSummary();

  return Response.json({
    data: summary,
  });
}
