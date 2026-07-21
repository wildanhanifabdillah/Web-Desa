import { listAdminStatistics } from "@/lib/admin-statistics-store";

export async function GET() {
  const { metrics } = await listAdminStatistics({ status: "published" });

  return Response.json({
    data: metrics.filter((metric) => metric.featured).slice(0, 4),
  });
}
