import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type ProfileHistoryRecord = {
  id: string;
  period: string;
  title: string;
  description: string;
  displayOrder: number;
  updatedAt: string;
};

export type ProfileHistoryInput = Omit<ProfileHistoryRecord, "id" | "updatedAt">;

const initialProfileHistoryRecords: ProfileHistoryRecord[] = [
  {
    id: "5ff23f7a-f1e7-4315-9d79-5fb3d6f50501",
    period: "Masa awal",
    title: "Permukiman tumbuh di sekitar lahan produktif",
    description:
      "Warga mulai membangun ruang hidup desa dari aktivitas bertani, berbagi sumber air, dan kerja kolektif antar-keluarga.",
    displayOrder: 1,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "5ff23f7a-f1e7-4315-9d79-5fb3d6f50502",
    period: "Penguatan dusun",
    title: "Gotong royong menjadi pola utama pembangunan",
    description:
      "Kegiatan jalan lingkungan, saluran air, dan ruang berkumpul warga dikerjakan melalui musyawarah serta swadaya masyarakat.",
    displayOrder: 2,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "5ff23f7a-f1e7-4315-9d79-5fb3d6f50503",
    period: "Era pelayanan publik",
    title: "Administrasi desa semakin tertata",
    description:
      "Perangkat desa mulai menata layanan kependudukan, arsip, dan program pembangunan agar lebih mudah dijangkau warga.",
    displayOrder: 3,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "5ff23f7a-f1e7-4315-9d79-5fb3d6f50504",
    period: "Hari ini",
    title: "Keseneng masuk fase publikasi digital",
    description:
      "Profil, berita, statistik, potensi, dan dokumen publik disiapkan dalam kanal digital untuk memperluas keterbukaan informasi.",
    displayOrder: 4,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

let profileHistoryRecords = loadJsonFile("profile-history.json", initialProfileHistoryRecords);

export function listProfileHistoryRecords() {
  return [...profileHistoryRecords].sort((left, right) => left.displayOrder - right.displayOrder);
}

export function getProfileHistoryRecord(id: string) {
  return profileHistoryRecords.find((record) => record.id === id) ?? null;
}

export function createProfileHistoryRecord(input: ProfileHistoryInput) {
  const record: ProfileHistoryRecord = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };

  profileHistoryRecords = [...profileHistoryRecords, record];
  saveJsonFile("profile-history.json", profileHistoryRecords);

  return record;
}

export function updateProfileHistoryRecord(id: string, input: Partial<ProfileHistoryInput>) {
  const existingRecord = getProfileHistoryRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: ProfileHistoryRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    updatedAt: new Date().toISOString(),
  };

  profileHistoryRecords = profileHistoryRecords.map((record) =>
    record.id === id ? updatedRecord : record,
  );
  saveJsonFile("profile-history.json", profileHistoryRecords);

  return updatedRecord;
}

export function deleteProfileHistoryRecord(id: string) {
  const existingRecord = getProfileHistoryRecord(id);

  if (!existingRecord) {
    return null;
  }

  profileHistoryRecords = profileHistoryRecords.filter((record) => record.id !== id);
  saveJsonFile("profile-history.json", profileHistoryRecords);

  return existingRecord;
}

export function resetProfileHistoryRecords() {
  profileHistoryRecords = resetJsonFile("profile-history.json", initialProfileHistoryRecords);

  return listProfileHistoryRecords();
}

export function isProfileHistoryInput(value: unknown): value is ProfileHistoryInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileHistoryInput, unknown>>;

  return (
    typeof candidate.period === "string" &&
    candidate.period.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.displayOrder === "number" &&
    Number.isFinite(candidate.displayOrder)
  );
}

