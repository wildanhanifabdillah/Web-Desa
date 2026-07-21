import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type ProfileMissionInput = {
  focus: string;
  description: string;
};

export type ProfileVisionMissionRecord = {
  id: string;
  visionLabel: string;
  visionTitle: string;
  visionDescription: string;
  missions: ProfileMissionInput[];
  updatedAt: string;
};

export type ProfileVisionMissionInput = Omit<ProfileVisionMissionRecord, "id" | "updatedAt">;

const initialVisionMissionRecords: ProfileVisionMissionRecord[] = [
  {
    id: "d9fd8ab2-1db6-4c41-9797-26fc4ac60600",
    visionLabel: "Visi Desa",
    visionTitle:
      "Terwujudnya Desa Keseneng yang maju, terbuka, mandiri, dan berdaya melalui potensi lokal.",
    visionDescription:
      "Visi dan misi ini memakai data tiruan untuk memandu desain halaman, sehingga admin nantinya tinggal mengganti konten resmi desa.",
    missions: [
      {
        focus: "Pelayanan Publik",
        description: "Meningkatkan kualitas pelayanan desa yang cepat, terbuka, dan mudah diakses warga.",
      },
      {
        focus: "Potensi Lokal",
        description: "Menguatkan pertanian, kesenian, dan UMKM sebagai identitas ekonomi Desa Keseneng.",
      },
      {
        focus: "Partisipasi Warga",
        description: "Mendorong gotong royong, musyawarah, dan keterlibatan warga dalam pembangunan desa.",
      },
      {
        focus: "Digitalisasi Desa",
        description: "Mengembangkan pemanfaatan teknologi untuk pengelolaan data dan publikasi kegiatan desa.",
      },
    ],
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

let visionMissionRecords = loadJsonFile("profile-vision-mission.json", initialVisionMissionRecords);

export function listVisionMissionRecords() {
  return visionMissionRecords;
}

export function getVisionMissionRecord(id: string) {
  return visionMissionRecords.find((record) => record.id === id) ?? null;
}

export function createVisionMissionRecord(input: ProfileVisionMissionInput) {
  const record: ProfileVisionMissionRecord = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };

  visionMissionRecords = [...visionMissionRecords, record];
  saveJsonFile("profile-vision-mission.json", visionMissionRecords);

  return record;
}

export function updateVisionMissionRecord(id: string, input: Partial<ProfileVisionMissionInput>) {
  const existingRecord = getVisionMissionRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: ProfileVisionMissionRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    missions: input.missions ?? existingRecord.missions,
    updatedAt: new Date().toISOString(),
  };

  visionMissionRecords = visionMissionRecords.map((record) =>
    record.id === id ? updatedRecord : record,
  );
  saveJsonFile("profile-vision-mission.json", visionMissionRecords);

  return updatedRecord;
}

export function deleteVisionMissionRecord(id: string) {
  const existingRecord = getVisionMissionRecord(id);

  if (!existingRecord) {
    return null;
  }

  visionMissionRecords = visionMissionRecords.filter((record) => record.id !== id);
  saveJsonFile("profile-vision-mission.json", visionMissionRecords);

  return existingRecord;
}

export function resetVisionMissionRecords() {
  visionMissionRecords = resetJsonFile("profile-vision-mission.json", initialVisionMissionRecords);

  return visionMissionRecords;
}

export function isVisionMissionInput(value: unknown): value is ProfileVisionMissionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileVisionMissionInput, unknown>>;

  return (
    typeof candidate.visionLabel === "string" &&
    candidate.visionLabel.trim().length > 0 &&
    typeof candidate.visionTitle === "string" &&
    candidate.visionTitle.trim().length > 0 &&
    typeof candidate.visionDescription === "string" &&
    candidate.visionDescription.trim().length > 0 &&
    Array.isArray(candidate.missions) &&
    candidate.missions.every(isMissionInput)
  );
}

function isMissionInput(value: unknown): value is ProfileMissionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProfileMissionInput>;

  return (
    typeof candidate.focus === "string" &&
    candidate.focus.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0
  );
}

