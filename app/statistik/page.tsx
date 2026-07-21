import { SiteHeader } from "@/components/site-header";
import { StatisticsPage } from "@/components/statistics-page";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { StatisticMetric, StatisticSection } from "@/lib/statistics";

type StatisticsPayload = {
  overview: StatisticMetric[];
  sections: StatisticSection[];
};

export default async function StatistikPage() {
  const { data } = await fetchPublicApi<ApiResponse<StatisticsPayload>>("/api/statistics");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <StatisticsPage overview={data.overview} sections={data.sections} />
    </div>
  );
}
