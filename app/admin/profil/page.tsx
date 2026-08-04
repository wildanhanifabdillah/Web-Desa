import { AdminProfilePage } from "@/components/admin-profile-page";
import { listGeographyRecords } from "@/lib/profile-geography";
import { listVisionMissionRecords } from "@/lib/profile-vision-mission";

export const dynamic = "force-dynamic";

export default async function AdminProfilRoute() {
  const [geographyRecords, visionMissionRecords] = await Promise.all([
    listGeographyRecords(),
    listVisionMissionRecords(),
  ]);

  return (
    <AdminProfilePage
      initialGeography={geographyRecords[0]}
      initialVisionMission={visionMissionRecords[0]}
    />
  );
}
