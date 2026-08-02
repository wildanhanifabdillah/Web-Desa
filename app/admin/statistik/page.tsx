import { AdminStatisticsManager } from "@/components/admin-statistics-manager";
import { listAdminStatistics } from "@/lib/admin-statistics-store";

export const dynamic = "force-dynamic";

export default async function AdminStatistikPage() {
  const statistics = await listAdminStatistics();

  return (
    <AdminStatisticsManager
      initialMetrics={statistics.metrics}
      initialSections={statistics.sections}
    />
  );
}
