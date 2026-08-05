import { listAdminStatistics } from "@/lib/admin-statistics-store";

export async function GET() {
  const { metrics } = await listAdminStatistics({ status: "published", limit: 4 });

  return Response.json({
    data: metrics,
  });
}
