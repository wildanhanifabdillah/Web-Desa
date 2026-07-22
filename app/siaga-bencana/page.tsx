import { DisasterDashboardPage } from "@/components/disaster-dashboard-page";
import { SiteHeader } from "@/components/site-header";

export default function SiagaBencanaPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <DisasterDashboardPage />
    </div>
  );
}
