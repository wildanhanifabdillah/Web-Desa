import { getPotentialCategories, type PotentialCategory } from "@/lib/potential-categories";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type PotentialCategoryInput = Omit<PotentialCategory, "slug"> & {
  slug: string;
};

let categoryRecords: PotentialCategory[] | null = null;

async function ensureCategoryRecords() {
  if (!categoryRecords) {
    categoryRecords = loadJsonFile("potential-categories.json", await getPotentialCategories());
  }

  return categoryRecords ?? [];
}

export async function listCategoryRecords() {
  return ensureCategoryRecords();
}

export async function getCategoryRecord(slug: string) {
  const records = await ensureCategoryRecords();

  return records.find((record) => record.slug === slug) ?? null;
}

export async function createCategoryRecord(input: PotentialCategoryInput) {
  const records = await ensureCategoryRecords();
  const normalizedSlug = input.slug.trim().toLowerCase();

  if (records.some((record) => record.slug === normalizedSlug)) {
    return null;
  }

  const record: PotentialCategory = {
    ...input,
    slug: normalizedSlug,
  };

  categoryRecords = [...records, record];
  saveJsonFile("potential-categories.json", categoryRecords);

  return record;
}

export async function updateCategoryRecord(slug: string, input: Partial<PotentialCategoryInput>) {
  const records = await ensureCategoryRecords();
  const existingRecord = records.find((record) => record.slug === slug);

  if (!existingRecord) {
    return null;
  }

  const nextSlug = input.slug?.trim().toLowerCase() ?? existingRecord.slug;
  const updatedRecord: PotentialCategory = {
    ...existingRecord,
    ...input,
    slug: nextSlug,
    detail: input.detail ?? existingRecord.detail,
    gallery: input.gallery ?? existingRecord.gallery,
    stats: input.stats ?? existingRecord.stats,
    highlights: input.highlights ?? existingRecord.highlights,
  };

  categoryRecords = records.map((record) =>
    record.slug === slug ? updatedRecord : record,
  );
  saveJsonFile("potential-categories.json", categoryRecords);

  return updatedRecord;
}

export async function deleteCategoryRecord(slug: string) {
  const records = await ensureCategoryRecords();
  const existingRecord = records.find((record) => record.slug === slug);

  if (!existingRecord) {
    return null;
  }

  categoryRecords = records.filter((record) => record.slug !== slug);
  saveJsonFile("potential-categories.json", categoryRecords);

  return existingRecord;
}

export async function resetCategoryRecords() {
  categoryRecords = resetJsonFile("potential-categories.json", await getPotentialCategories());

  return categoryRecords ?? [];
}

export function isPotentialCategoryInput(value: unknown): value is PotentialCategoryInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PotentialCategoryInput>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.summary === "string" &&
    candidate.summary.trim().length > 0 &&
    typeof candidate.image === "string" &&
    candidate.image.trim().length > 0 &&
    isCategoryDetail(candidate.detail) &&
    Array.isArray(candidate.gallery) &&
    isCategoryStats(candidate.stats) &&
    Array.isArray(candidate.highlights) &&
    candidate.highlights.every((highlight) => typeof highlight === "string") &&
    typeof candidate.accentClassName === "string" &&
    candidate.accentClassName.trim().length > 0
  );
}

function isCategoryDetail(value: unknown): value is PotentialCategory["detail"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PotentialCategory["detail"]>;

  return (
    typeof candidate.eyebrow === "string" &&
    typeof candidate.intro === "string" &&
    typeof candidate.description === "string" &&
    Array.isArray(candidate.opportunities) &&
    Array.isArray(candidate.programs) &&
    !!candidate.contact
  );
}

function isCategoryStats(value: unknown): value is PotentialCategory["stats"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PotentialCategory["stats"]>;

  return typeof candidate.value === "string" && typeof candidate.label === "string";
}



