import { AdminProfilePage } from "@/components/admin-profile-page";
import { listProfileGeneralRecords } from "@/lib/profile-general";
import { listGeographyRecords } from "@/lib/profile-geography";
import { listVisionMissionRecords } from "@/lib/profile-vision-mission";

export const dynamic = "force-dynamic";

export default async function AdminProfilRoute() {
  const [generalRecords, geographyRecords, visionMissionRecords] = await Promise.all([
    listProfileGeneralRecords(),
    listGeographyRecords(),
    listVisionMissionRecords(),
  ]);

  return (
    <AdminProfilePage
      initialGeneral={generalRecords[0]}
      initialGeography={geographyRecords[0]}
      initialVisionMission={visionMissionRecords[0]}
    />
  );
}