import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type ProfileOfficialRecord = {
  id: string;
  name: string;
  role: string;
  focus: string;
  contact: string;
  area: string;
  photoUrl?: string;
  photoAlt?: string;
  displayOrder: number;
  updatedAt: string;
};

export type ProfileOfficialInput = Omit<ProfileOfficialRecord, "id" | "updatedAt">;

const initialOfficialRecords: ProfileOfficialRecord[] = [
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60701",
    name: "Mugiharto, S.IP",
    role: "Kepala Desa",
    focus: "Koordinasi pemerintahan dan arah pembangunan desa",
    contact: "kades@keseneng.desa.id",
    area: "Pemerintahan",
    displayOrder: 1,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60702",
    name: "Dwi Hermawan, ST",
    role: "Sekretaris Desa",
    focus: "Administrasi, arsip, dan layanan informasi publik",
    contact: "sekdes@keseneng.desa.id",
    area: "Administrasi",
    displayOrder: 2,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60703",
    name: "Nisro, S.Sos",
    role: "Kepala Urusan Keuangan",
    focus: "Pengelolaan anggaran, pembukuan, dan laporan keuangan desa",
    contact: "keuangan@keseneng.desa.id",
    area: "Keuangan",
    displayOrder: 3,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60704",
    name: "Sigit Hidayat",
    role: "Kepala Urusan Umum dan Perencanaan",
    focus: "Perencanaan program, aset, dan tata usaha umum desa",
    contact: "perencanaan@keseneng.desa.id",
    area: "Perencanaan",
    displayOrder: 4,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60705",
    name: "Nurkhotib",
    role: "Kepala Seksi Pelayanan dan Kesejahteraan",
    focus: "Pelayanan sosial, pemberdayaan, dan kesejahteraan warga",
    contact: "pelayanan@keseneng.desa.id",
    area: "Pelayanan",
    displayOrder: 5,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60706",
    name: "Sukarmiyadi",
    role: "Kepala Seksi Pemerintahan",
    focus: "Ketertiban administrasi wilayah dan urusan pemerintahan desa",
    contact: "pemerintahan@keseneng.desa.id",
    area: "Pemerintahan",
    displayOrder: 6,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "2e10ba37-95a5-42b0-9795-fb0b63d60707",
    name: "Surman Al Nurman Yuwono",
    role: "Kepala Dusun Bugel",
    focus: "Koordinasi layanan warga dan kegiatan kewilayahan Dusun Bugel",
    contact: "bugel@keseneng.desa.id",
    area: "Kewilayahan",
    displayOrder: 7,
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

let officialRecords = loadJsonFile("profile-officials.json", initialOfficialRecords);

export function listOfficialRecords() {
  return [...officialRecords].sort((left, right) => left.displayOrder - right.displayOrder);
}

export function getOfficialRecord(id: string) {
  return officialRecords.find((record) => record.id === id) ?? null;
}

export function createOfficialRecord(input: ProfileOfficialInput) {
  const record: ProfileOfficialRecord = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };

  officialRecords = [...officialRecords, record];
  saveJsonFile("profile-officials.json", officialRecords);

  return record;
}

export function updateOfficialRecord(id: string, input: Partial<ProfileOfficialInput>) {
  const existingRecord = getOfficialRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: ProfileOfficialRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    updatedAt: new Date().toISOString(),
  };

  officialRecords = officialRecords.map((record) => (record.id === id ? updatedRecord : record));
  saveJsonFile("profile-officials.json", officialRecords);

  return updatedRecord;
}

export function deleteOfficialRecord(id: string) {
  const existingRecord = getOfficialRecord(id);

  if (!existingRecord) {
    return null;
  }

  officialRecords = officialRecords.filter((record) => record.id !== id);
  saveJsonFile("profile-officials.json", officialRecords);

  return existingRecord;
}

export function resetOfficialRecords() {
  officialRecords = resetJsonFile("profile-officials.json", initialOfficialRecords);

  return listOfficialRecords();
}

export function isOfficialInput(value: unknown): value is ProfileOfficialInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileOfficialInput, unknown>>;

  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.role === "string" &&
    candidate.role.trim().length > 0 &&
    typeof candidate.focus === "string" &&
    candidate.focus.trim().length > 0 &&
    typeof candidate.contact === "string" &&
    candidate.contact.trim().length > 0 &&
    typeof candidate.area === "string" &&
    candidate.area.trim().length > 0 &&
    (candidate.photoUrl === undefined || typeof candidate.photoUrl === "string") &&
    (candidate.photoAlt === undefined || typeof candidate.photoAlt === "string") &&
    typeof candidate.displayOrder === "number" &&
    Number.isFinite(candidate.displayOrder)
  );
}


