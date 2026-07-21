import { getPotentialCategories } from "@/lib/potential-categories";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type PotentialItemRecord = {
  id: string;
  categorySlug: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  updatedAt: string;
};

export type PotentialItemInput = Omit<PotentialItemRecord, "id" | "updatedAt">;

let potentialItemRecords: PotentialItemRecord[] | null = null;

async function ensurePotentialItemRecords() {
  if (!potentialItemRecords) {
    potentialItemRecords = loadJsonFile("potential-items.json", await getInitialPotentialItemRecords());
  }

  return potentialItemRecords ?? [];
}

async function getInitialPotentialItemRecords(): Promise<PotentialItemRecord[]> {
  const categories = await getPotentialCategories();

  return categories.flatMap((category) =>
    category.gallery.map((galleryItem, index) => ({
      id: `${category.slug}-${index + 1}`,
      categorySlug: category.slug,
      title: galleryItem.title,
      slug: `${category.slug}-${index + 1}`,
      summary: galleryItem.description,
      description: galleryItem.description,
      image: galleryItem.image,
      imageAlt: galleryItem.title,
      status: index === category.gallery.length - 1 ? "draft" as const : "published" as const,
      publishedAt: index === category.gallery.length - 1 ? null : "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-12T00:00:00.000Z",
    })),
  );
}

export async function listPotentialItems() {
  return ensurePotentialItemRecords();
}

export async function getPotentialItem(idOrSlug: string) {
  const records = await ensurePotentialItemRecords();

  return records.find((record) => record.id === idOrSlug || record.slug === idOrSlug) ?? null;
}

export async function createPotentialItem(input: PotentialItemInput) {
  const records = await ensurePotentialItemRecords();
  const normalizedSlug = input.slug.trim().toLowerCase();

  if (records.some((record) => record.slug === normalizedSlug)) {
    return null;
  }

  const record: PotentialItemRecord = {
    ...input,
    id: crypto.randomUUID(),
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
  };

  potentialItemRecords = [...records, record];
  saveJsonFile("potential-items.json", potentialItemRecords);

  return record;
}

export async function updatePotentialItem(idOrSlug: string, input: Partial<PotentialItemInput>) {
  const records = await ensurePotentialItemRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  const updatedRecord: PotentialItemRecord = {
    ...existingRecord,
    ...input,
    id: existingRecord.id,
    slug: input.slug?.trim().toLowerCase() ?? existingRecord.slug,
    updatedAt: new Date().toISOString(),
  };

  potentialItemRecords = records.map((record) =>
    record.id === existingRecord.id ? updatedRecord : record,
  );
  saveJsonFile("potential-items.json", potentialItemRecords);

  return updatedRecord;
}

export async function deletePotentialItem(idOrSlug: string) {
  const records = await ensurePotentialItemRecords();
  const existingRecord = records.find(
    (record) => record.id === idOrSlug || record.slug === idOrSlug,
  );

  if (!existingRecord) {
    return null;
  }

  potentialItemRecords = records.filter((record) => record.id !== existingRecord.id);
  saveJsonFile("potential-items.json", potentialItemRecords);

  return existingRecord;
}

export async function resetPotentialItems() {
  potentialItemRecords = resetJsonFile("potential-items.json", await getInitialPotentialItemRecords());

  return potentialItemRecords ?? [];
}

export function isPotentialItemInput(value: unknown): value is PotentialItemInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PotentialItemInput>;

  return (
    typeof candidate.categorySlug === "string" &&
    candidate.categorySlug.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.summary === "string" &&
    candidate.summary.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.image === "string" &&
    candidate.image.trim().length > 0 &&
    typeof candidate.imageAlt === "string" &&
    candidate.imageAlt.trim().length > 0 &&
    (candidate.status === "draft" ||
      candidate.status === "published" ||
      candidate.status === "archived") &&
    (typeof candidate.publishedAt === "string" || candidate.publishedAt === null)
  );
}




