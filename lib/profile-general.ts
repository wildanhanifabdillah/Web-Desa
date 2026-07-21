import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type ProfileGeneralRecord = {
  id: string;
  slug: string;
  villageName: string;
  district: string;
  regency: string;
  province: string;
  character: string;
  description: string;
  area: string;
  elevation: string;
  dominantLandUse: string;
  updatedAt: string;
};

export type ProfileGeneralInput = Omit<ProfileGeneralRecord, "id" | "updatedAt">;

const initialProfileGeneralRecords: ProfileGeneralRecord[] = [
  {
    id: "0c7f0d5b-8534-4e1f-bb1b-9d0a6aa41a01",
    slug: "desa-keseneng",
    villageName: "Desa Keseneng",
    district: "Mojotengah",
    regency: "Wonosobo",
    province: "Jawa Tengah",
    character: "Agraris dan budaya",
    description:
      "Desa Keseneng berada di wilayah perbukitan dengan potensi pertanian, kesenian, UMKM, dan tradisi gotong royong warga.",
    area: "328 ha",
    elevation: "820 mdpl",
    dominantLandUse: "Sawah dan kebun",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

let profileGeneralRecords = loadJsonFile("profile-general.json", initialProfileGeneralRecords);

export function listProfileGeneralRecords() {
  return profileGeneralRecords;
}

export function getProfileGeneralRecord(id: string) {
  return profileGeneralRecords.find((record) => record.id === id) ?? null;
}

export function createProfileGeneralRecord(input: ProfileGeneralInput) {
  const now = new Date().toISOString();
  const record: ProfileGeneralRecord = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: now,
  };

  profileGeneralRecords = [...profileGeneralRecords, record];
  saveJsonFile("profile-general.json", profileGeneralRecords);

  return record;
}

export function updateProfileGeneralRecord(id: string, input: Partial<ProfileGeneralInput>) {
  const existingRecord = getProfileGeneralRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: ProfileGeneralRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    updatedAt: new Date().toISOString(),
  };

  profileGeneralRecords = profileGeneralRecords.map((record) =>
    record.id === id ? updatedRecord : record,
  );
  saveJsonFile("profile-general.json", profileGeneralRecords);

  return updatedRecord;
}

export function deleteProfileGeneralRecord(id: string) {
  const existingRecord = getProfileGeneralRecord(id);

  if (!existingRecord) {
    return null;
  }

  profileGeneralRecords = profileGeneralRecords.filter((record) => record.id !== id);
  saveJsonFile("profile-general.json", profileGeneralRecords);

  return existingRecord;
}

export function resetProfileGeneralRecords() {
  profileGeneralRecords = resetJsonFile("profile-general.json", initialProfileGeneralRecords);

  return profileGeneralRecords;
}

export function isProfileGeneralInput(value: unknown): value is ProfileGeneralInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileGeneralInput, unknown>>;
  const requiredStringFields: Array<keyof ProfileGeneralInput> = [
    "slug",
    "villageName",
    "district",
    "regency",
    "province",
    "character",
    "description",
    "area",
    "elevation",
    "dominantLandUse",
  ];

  return requiredStringFields.every(
    (field) => typeof candidate[field] === "string" && candidate[field].trim().length > 0,
  );
}

