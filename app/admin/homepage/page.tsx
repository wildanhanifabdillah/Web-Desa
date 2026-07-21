import { AdminHomepagePage } from "@/components/admin-homepage-page";
import { getActiveHomepageHeroBanner } from "@/lib/homepage-hero-banner";
import { getHomepageProfileSummary } from "@/lib/homepage-profile-summary";

export default async function AdminHomepageRoute() {
  const [hero, profileSummary] = await Promise.all([
    getActiveHomepageHeroBanner(),
    getHomepageProfileSummary(),
  ]);

  return <AdminHomepagePage initialHero={hero} initialProfileSummary={profileSummary} />;
}
