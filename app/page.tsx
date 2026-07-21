import {
  HomepageHero,
  LatestNewsSection,
  PotentialSection,
  ProfileSummarySection,
  StatisticsSection,
  TransparencyCallout,
} from "@/components/homepage-sections";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <SiteHeader />
      <main>
        <HomepageHero />
        <StatisticsSection />
        <ProfileSummarySection />
        <PotentialSection />
        <LatestNewsSection />
        <TransparencyCallout />
      </main>
    </div>
  );
}
