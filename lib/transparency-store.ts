import {
  getTransparencyDocuments,
  type TransparencyDocument,
} from "@/lib/transparency";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type TransparencyDocumentInput = Omit<TransparencyDocument, "id"> & {
  id?: string;
};

let transparencyRecords: TransparencyDocument[] | null = null;

async function ensureTransparencyRecords() {
  if (!transparencyRecords) {
    transparencyRecords = loadJsonFile("transparency-documents.json", await getTransparencyDocuments());
  }

  return transparencyRecords ?? [];
}

export async function listTransparencyRecords() {
  return ensureTransparencyRecords();
}

export async function getTransparencyRecord(idOrSlug: string) {
  const records = await ensureTransparencyRecords();

  return records.find((record) => record.id === idOrSlug || record.slug === idOrSlug) ?? null;
}

export async function createTransparencyRecord(input: TransparencyDocumentInput) {
  const records = await ensureTransparencyRecords();
  const normalizedSlug = input.slug.trim().toLowerCase();

  if (records.some((record) => record.slug === normalizedSlug)) {
    return null;
  }

  const record: TransparencyDocument = {
    ...input,
    id: input.id?.trim() || crypto.randomUUID(),
    slug: normalizedSlug,
  };

  transparencyRecords = [...records, record];
  saveJsonFile("transparency-documents.json", transparencyRecords);

  return record;
}

export async function updateTransparencyRecord(
  idOrSlug: string,
  input: Partial<TransparencyDocumentInput>,
) {
  const records = await ensureTransparencyRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: TransparencyDocument = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    slug: input.slug?.trim().toLowerCase() ?? existingRecord.slug,
  };

  transparencyRecords = records.map((record) =>
    record.id === existingRecord.id ? updatedRecord : record,
  );
  saveJsonFile("transparency-documents.json", transparencyRecords);

  return updatedRecord;
}

export async function deleteTransparencyRecord(idOrSlug: string) {
  const records = await ensureTransparencyRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  transparencyRecords = records.filter((record) => record.id !== existingRecord.id);
  saveJsonFile("transparency-documents.json", transparencyRecords);

  return existingRecord;
}

export async function resetTransparencyRecords() {
  transparencyRecords = resetJsonFile("transparency-documents.json", await getTransparencyDocuments());

  return transparencyRecords ?? [];
}

export function isTransparencyDocumentInput(value: unknown): value is TransparencyDocumentInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TransparencyDocumentInput>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.category === "string" &&
    candidate.category.trim().length > 0 &&
    typeof candidate.year === "number" &&
    Number.isInteger(candidate.year) &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.fileType === "string" &&
    candidate.fileType.trim().length > 0 &&
    typeof candidate.fileSize === "string" &&
    candidate.fileSize.trim().length > 0 &&
    (candidate.fileUrl === undefined || typeof candidate.fileUrl === "string") &&
    typeof candidate.publishedAt === "string" &&
    candidate.publishedAt.trim().length > 0 &&
    (candidate.status === "Dipublikasikan" || candidate.status === "Draf")
  );
}


