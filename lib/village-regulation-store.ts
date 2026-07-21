import {
  getVillageRegulations,
  type VillageRegulation,
} from "@/lib/village-regulations";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type VillageRegulationInput = Omit<VillageRegulation, "id"> & {
  id?: string;
};

let regulationRecords: VillageRegulation[] | null = null;

export async function listVillageRegulationRecords() {
  return ensureRegulationRecords();
}

export async function getVillageRegulationRecord(idOrSlug: string) {
  const records = await ensureRegulationRecords();

  return records.find((record) => record.id === idOrSlug || record.slug === idOrSlug) ?? null;
}

export async function createVillageRegulationRecord(input: VillageRegulationInput) {
  const records = await ensureRegulationRecords();
  const normalizedSlug = input.slug.trim().toLowerCase();

  if (records.some((record) => record.slug === normalizedSlug)) {
    return null;
  }

  const record: VillageRegulation = {
    ...input,
    id: input.id?.trim() || crypto.randomUUID(),
    slug: normalizedSlug,
  };

  regulationRecords = [...records, record];
  saveJsonFile("village-regulations.json", regulationRecords);

  return record;
}

export async function updateVillageRegulationRecord(
  idOrSlug: string,
  input: Partial<VillageRegulationInput>,
) {
  const records = await ensureRegulationRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: VillageRegulation = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    slug: input.slug?.trim().toLowerCase() ?? existingRecord.slug,
  };

  regulationRecords = records.map((record) =>
    record.id === existingRecord.id ? updatedRecord : record,
  );
  saveJsonFile("village-regulations.json", regulationRecords);

  return updatedRecord;
}

export async function deleteVillageRegulationRecord(idOrSlug: string) {
  const records = await ensureRegulationRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  regulationRecords = records.filter((record) => record.id !== existingRecord.id);
  saveJsonFile("village-regulations.json", regulationRecords);

  return existingRecord;
}

export async function resetVillageRegulationRecords() {
  regulationRecords = resetJsonFile("village-regulations.json", await getVillageRegulations());

  return regulationRecords ?? [];
}

export function isVillageRegulationInput(value: unknown): value is VillageRegulationInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<VillageRegulationInput>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.number === "string" &&
    candidate.number.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.year === "number" &&
    Number.isInteger(candidate.year) &&
    typeof candidate.category === "string" &&
    candidate.category.trim().length > 0 &&
    typeof candidate.summary === "string" &&
    candidate.summary.trim().length > 0 &&
    (candidate.fileUrl === undefined || typeof candidate.fileUrl === "string") &&
    typeof candidate.fileType === "string" &&
    candidate.fileType.trim().length > 0 &&
    typeof candidate.fileSize === "string" &&
    candidate.fileSize.trim().length > 0 &&
    typeof candidate.enactedAt === "string" &&
    candidate.enactedAt.trim().length > 0 &&
    isVillageRegulationStatus(candidate.status)
  );
}

export function isVillageRegulationStatus(
  value: unknown,
): value is VillageRegulation["status"] {
  return value === "Berlaku" || value === "Arsip";
}

async function ensureRegulationRecords() {
  if (!regulationRecords) {
    regulationRecords = loadJsonFile("village-regulations.json", await getVillageRegulations());
  }

  return regulationRecords ?? [];
}





