import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type ProfileGeographyFact = {
  label: string;
  value: string;
};

export type ProfileGeographyRecord = {
  id: string;
  title: string;
  description: string;
  stats: ProfileGeographyFact[];
  borders: ProfileGeographyFact[];
  updatedAt: string;
};

export type ProfileGeographyInput = Omit<ProfileGeographyRecord, "id" | "updatedAt">;

const initialGeographyRecords: ProfileGeographyRecord[] = [
  {
    id: "44be20e1-3628-4ca4-b6e8-f42ad4e70200",
    title: "Lanskap desa yang mendukung pangan dan wisata lokal.",
    description:
      "Wilayah desa didominasi area permukiman, sawah, kebun, dan ruang kegiatan warga sebagai modal pengembangan pertanian produktif serta potensi kunjungan berbasis budaya desa.",
    stats: [
      { label: "Luas wilayah", value: "3,21 km2" },
      { label: "Jumlah dusun", value: "2 dusun" },
      { label: "Ketinggian", value: "820 mdpl" },
      { label: "Dominasi lahan", value: "Sawah dan kebun" },
    ],
    borders: [
      { label: "Utara", value: "Desa Sojopuro" },
      { label: "Timur", value: "Desa Mudal" },
      { label: "Selatan", value: "Desa Lengkong" },
      { label: "Barat", value: "Akses wilayah dan lahan warga Desa Keseneng dan Gunung Kembang" },
    ],
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

let geographyRecords = loadJsonFile("profile-geography.json", initialGeographyRecords);

export function listGeographyRecords() {
  return geographyRecords;
}

export function getGeographyRecord(id: string) {
  return geographyRecords.find((record) => record.id === id) ?? null;
}

export function createGeographyRecord(input: ProfileGeographyInput) {
  const record: ProfileGeographyRecord = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };

  geographyRecords = [...geographyRecords, record];
  saveJsonFile("profile-geography.json", geographyRecords);

  return record;
}

export function updateGeographyRecord(id: string, input: Partial<ProfileGeographyInput>) {
  const existingRecord = getGeographyRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: ProfileGeographyRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    stats: input.stats ?? existingRecord.stats,
    borders: input.borders ?? existingRecord.borders,
    updatedAt: new Date().toISOString(),
  };

  geographyRecords = geographyRecords.map((record) =>
    record.id === id ? updatedRecord : record,
  );
  saveJsonFile("profile-geography.json", geographyRecords);

  return updatedRecord;
}

export function deleteGeographyRecord(id: string) {
  const existingRecord = getGeographyRecord(id);

  if (!existingRecord) {
    return null;
  }

  geographyRecords = geographyRecords.filter((record) => record.id !== id);
  saveJsonFile("profile-geography.json", geographyRecords);

  return existingRecord;
}

export function resetGeographyRecords() {
  geographyRecords = resetJsonFile("profile-geography.json", initialGeographyRecords);

  return geographyRecords;
}

export function isGeographyInput(value: unknown): value is ProfileGeographyInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileGeographyInput, unknown>>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    Array.isArray(candidate.stats) &&
    candidate.stats.every(isGeographyFact) &&
    Array.isArray(candidate.borders) &&
    candidate.borders.every(isGeographyFact)
  );
}

function isGeographyFact(value: unknown): value is ProfileGeographyFact {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProfileGeographyFact>;

  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.value === "string" &&
    candidate.value.trim().length > 0
  );
}


