import { ProfilePage } from "@/components/profile-page";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { ProfileData } from "@/lib/profile";

export default async function ProfilPage() {
  const { data: profile } = await fetchPublicApi<ApiResponse<ProfileData>>("/api/profile");

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <ProfilePage profile={profile} />
    </div>
  );
}
