import type { RowDataPacket } from "mysql2";
import { executeSql, isDatabaseConfigured, queryRows, type SqlValue } from "@/lib/db";
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

type PotentialItemSqlRow = RowDataPacket & {
  id: string;
  category_slug: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string;
  image_alt: string;
  status: PotentialItemRecord["status"];
  published_at: Date | string | null;
  updated_at: Date | string;
};

type CategoryIdRow = RowDataPacket & { id: string };

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
  if (isDatabaseConfigured()) {
    return listSqlPotentialItems();
  }

  return ensurePotentialItemRecords();
}

export async function getPotentialItem(idOrSlug: string) {
  if (isDatabaseConfigured()) {
    return getSqlPotentialItem(idOrSlug);
  }

  const records = await ensurePotentialItemRecords();

  return records.find((record) => record.id === idOrSlug || record.slug === idOrSlug) ?? null;
}

export async function createPotentialItem(input: PotentialItemInput) {
  if (isDatabaseConfigured()) {
    return createSqlPotentialItem(input);
  }

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
  if (isDatabaseConfigured()) {
    return updateSqlPotentialItem(idOrSlug, input);
  }

  const records = await ensurePotentialItemRecords();
  const existingRecord = records.find((record) => record.id === idOrSlug || record.slug === idOrSlug);

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

  potentialItemRecords = records.map((record) => record.id === existingRecord.id ? updatedRecord : record);
  saveJsonFile("potential-items.json", potentialItemRecords);

  return updatedRecord;
}

export async function deletePotentialItem(idOrSlug: string) {
  if (isDatabaseConfigured()) {
    return deleteSqlPotentialItem(idOrSlug);
  }

  const records = await ensurePotentialItemRecords();
  const existingRecord = records.find((record) => record.id === idOrSlug || record.slug === idOrSlug);

  if (!existingRecord) {
    return null;
  }

  potentialItemRecords = records.filter((record) => record.id !== existingRecord.id);
  saveJsonFile("potential-items.json", potentialItemRecords);

  return existingRecord;
}

export async function resetPotentialItems() {
  if (isDatabaseConfigured()) {
    const records = await getInitialPotentialItemRecords();
    await executeSql("DELETE FROM potential_items");

    for (const record of records) {
      await createSqlPotentialItem(record);
    }

    return listSqlPotentialItems();
  }

  potentialItemRecords = resetJsonFile("potential-items.json", await getInitialPotentialItemRecords());

  return potentialItemRecords ?? [];
}

async function listSqlPotentialItems() {
  const rows = await queryRows<PotentialItemSqlRow>(
    `SELECT potential_items.*, potential_categories.slug AS category_slug
    FROM potential_items
    INNER JOIN potential_categories ON potential_categories.id = potential_items.category_id
    WHERE potential_items.status <> 'archived'
    ORDER BY potential_categories.display_order ASC, potential_items.display_order ASC, potential_items.updated_at DESC`,
  );

  return rows.map(mapSqlPotentialItem);
}

async function getSqlPotentialItem(idOrSlug: string) {
  const rows = await queryRows<PotentialItemSqlRow>(
    `SELECT potential_items.*, potential_categories.slug AS category_slug
    FROM potential_items
    INNER JOIN potential_categories ON potential_categories.id = potential_items.category_id
    WHERE potential_items.id = ? OR potential_items.slug = ?
    LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ? mapSqlPotentialItem(rows[0]) : null;
}

async function createSqlPotentialItem(input: PotentialItemInput) {
  const normalizedSlug = input.slug.trim().toLowerCase();
  const existing = await getSqlPotentialItem(normalizedSlug);

  if (existing) {
    return null;
  }

  const categoryId = await getCategoryId(input.categorySlug);

  if (!categoryId) {
    return null;
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM potential_items WHERE category_id = ?", [categoryId]);
  const id = crypto.randomUUID();
  const values: SqlValue[] = [
    id,
    categoryId,
    input.title,
    normalizedSlug,
    input.summary,
    input.description,
    input.image,
    input.imageAlt,
    input.status,
    toMysqlDateTime(input.publishedAt),
    orderRows[0]?.next_order ?? 1,
    input.title,
    input.summary.slice(0, 320),
  ];

  await executeSql(
    `INSERT INTO potential_items (id, category_id, title, slug, summary, description, image_url, image_alt, status, published_at, display_order, seo_title, seo_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
  );

  return getSqlPotentialItem(id);
}

async function updateSqlPotentialItem(idOrSlug: string, input: Partial<PotentialItemInput>) {
  const current = await getSqlPotentialItem(idOrSlug);

  if (!current) {
    return null;
  }

  const merged: PotentialItemRecord = {
    ...current,
    ...input,
    id: current.id,
    slug: input.slug?.trim().toLowerCase() ?? current.slug,
    updatedAt: new Date().toISOString(),
  };
  const categoryId = await getCategoryId(merged.categorySlug);

  if (!categoryId) {
    return null;
  }

  await executeSql(
    `UPDATE potential_items SET category_id = ?, title = ?, slug = ?, summary = ?, description = ?, image_url = ?, image_alt = ?, status = ?, published_at = ?, seo_title = ?, seo_description = ? WHERE id = ?`,
    [categoryId, merged.title, merged.slug, merged.summary, merged.description, merged.image, merged.imageAlt, merged.status, toMysqlDateTime(merged.publishedAt), merged.title, merged.summary.slice(0, 320), merged.id],
  );

  return getSqlPotentialItem(merged.id);
}

async function deleteSqlPotentialItem(idOrSlug: string) {
  const current = await getSqlPotentialItem(idOrSlug);

  if (!current) {
    return null;
  }

  await executeSql("DELETE FROM potential_items WHERE id = ?", [current.id]);

  return current;
}

async function getCategoryId(slug: string) {
  const rows = await queryRows<CategoryIdRow>("SELECT id FROM potential_categories WHERE slug = ? LIMIT 1", [slug]);

  return rows[0]?.id ?? null;
}

function mapSqlPotentialItem(row: PotentialItemSqlRow): PotentialItemRecord {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    image: row.image_url,
    imageAlt: row.image_alt,
    status: row.status,
    publishedAt: normalizeSqlDate(row.published_at),
    updatedAt: normalizeSqlDate(row.updated_at) ?? new Date().toISOString(),
  };
}

function normalizeSqlDate(value: Date | string | null) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toMysqlDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
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
