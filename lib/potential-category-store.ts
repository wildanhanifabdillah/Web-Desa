import type { RowDataPacket } from "mysql2";
import { executeSql, isDatabaseConfigured, queryRows, type SqlValue } from "@/lib/db";
import { getPotentialCategories, type PotentialCategory } from "@/lib/potential-categories";
import { listPotentialItems, type PotentialItemRecord } from "@/lib/potential-item-store";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type PotentialCategoryInput = Omit<PotentialCategory, "slug"> & {
  slug: string;
};

type CategoryRow = RowDataPacket & {
  id: string;
  slug: string;
  label: string;
  title: string;
  summary: string;
  image_url: string;
  accent_class_name: string;
  stat_value: string;
  stat_label: string;
  detail_eyebrow: string;
  detail_intro: string;
  detail_description: string;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  display_order: number;
};

type OrderedTextRow = RowDataPacket & { category_id: string; value_text: string };
type ProgramRow = RowDataPacket & { category_id: string; title: string; description: string };
type GalleryRow = RowDataPacket & { category_id: string; title: string; description: string; image_url: string };
type ItemGalleryRow = RowDataPacket & { category_id: string; title: string; description: string; image_url: string };

let categoryRecords: PotentialCategory[] | null = null;

async function ensureCategoryRecords() {
  if (!categoryRecords) {
    categoryRecords = loadJsonFile("potential-categories.json", await getPotentialCategories());
  }

  return categoryRecords ?? [];
}

export async function listCategoryRecords() {
  if (isDatabaseConfigured()) {
    return listSqlCategoryRecords();
  }

  return hydrateFallbackCategories(await ensureCategoryRecords());
}

export async function getCategoryRecord(slug: string) {
  if (isDatabaseConfigured()) {
    return getSqlCategoryRecord(slug);
  }

  const records = await ensureCategoryRecords();
  const hydratedRecords = await hydrateFallbackCategories(records);

  return hydratedRecords.find((record) => record.slug === slug) ?? null;
}

export async function createCategoryRecord(input: PotentialCategoryInput) {
  if (isDatabaseConfigured()) {
    return createSqlCategoryRecord(input);
  }

  const records = await ensureCategoryRecords();
  const normalizedSlug = input.slug.trim().toLowerCase();

  if (records.some((record) => record.slug === normalizedSlug)) {
    return null;
  }

  const record: PotentialCategory = { ...input, slug: normalizedSlug };

  categoryRecords = [...records, record];
  saveJsonFile("potential-categories.json", categoryRecords);

  return record;
}

export async function updateCategoryRecord(slug: string, input: Partial<PotentialCategoryInput>) {
  if (isDatabaseConfigured()) {
    return updateSqlCategoryRecord(slug, input);
  }

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

  categoryRecords = records.map((record) => record.slug === slug ? updatedRecord : record);
  saveJsonFile("potential-categories.json", categoryRecords);

  return updatedRecord;
}

export async function deleteCategoryRecord(slug: string) {
  if (isDatabaseConfigured()) {
    const existing = await getSqlCategoryRecord(slug);

    if (!existing) {
      return null;
    }

    await executeSql("UPDATE potential_categories SET status = 'archived', is_active = FALSE WHERE slug = ?", [slug]);

    return existing;
  }

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
  if (isDatabaseConfigured()) {
    const fallback = await getPotentialCategories();

    for (const category of fallback) {
      await createSqlCategoryRecord({ ...category, slug: category.slug });
    }

    return listSqlCategoryRecords();
  }

  categoryRecords = resetJsonFile("potential-categories.json", await getPotentialCategories());

  return categoryRecords ?? [];
}

async function listSqlCategoryRecords() {
  const rows = await queryRows<CategoryRow>("SELECT * FROM potential_categories WHERE is_active = TRUE AND status = 'published' ORDER BY display_order ASC, label ASC");

  return hydrateSqlCategories(rows);
}

async function getSqlCategoryRecord(slug: string) {
  const rows = await queryRows<CategoryRow>("SELECT * FROM potential_categories WHERE slug = ? LIMIT 1", [slug]);
  const records = await hydrateSqlCategories(rows);

  return records[0] ?? null;
}

async function createSqlCategoryRecord(input: PotentialCategoryInput) {
  const normalizedSlug = input.slug.trim().toLowerCase();
  const existing = await getSqlCategoryRecord(normalizedSlug);

  if (existing) {
    return null;
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM potential_categories");
  await upsertSqlCategory(crypto.randomUUID(), { ...input, slug: normalizedSlug }, orderRows[0]?.next_order ?? 1);

  return getSqlCategoryRecord(normalizedSlug);
}

async function updateSqlCategoryRecord(slug: string, input: Partial<PotentialCategoryInput>) {
  const currentRows = await queryRows<CategoryRow>("SELECT * FROM potential_categories WHERE slug = ? LIMIT 1", [slug]);
  const current = currentRows[0];

  if (!current) {
    return null;
  }

  const currentRecord = (await hydrateSqlCategories([current]))[0];
  const merged: PotentialCategory = {
    ...currentRecord,
    ...input,
    slug: input.slug?.trim().toLowerCase() ?? currentRecord.slug,
    detail: input.detail ?? currentRecord.detail,
    gallery: input.gallery ?? currentRecord.gallery,
    stats: input.stats ?? currentRecord.stats,
    highlights: input.highlights ?? currentRecord.highlights,
  };

  await upsertSqlCategory(current.id, { ...merged, slug: merged.slug }, current.display_order ?? 1);

  return getSqlCategoryRecord(merged.slug);
}

async function upsertSqlCategory(id: string, input: PotentialCategoryInput, displayOrder: number) {
  const detail = input.detail;
  const values: SqlValue[] = [
    id,
    input.slug,
    input.label,
    input.title,
    input.summary,
    input.image,
    input.accentClassName,
    input.stats.value,
    input.stats.label,
    detail.eyebrow,
    detail.intro,
    detail.description,
    detail.contact.name,
    detail.contact.role,
    detail.contact.email,
    displayOrder,
    input.title,
    input.summary.slice(0, 320),
  ];

  await executeSql(
    `INSERT INTO potential_categories (id, slug, label, title, summary, image_url, accent_class_name, stat_value, stat_label, detail_eyebrow, detail_intro, detail_description, contact_name, contact_role, contact_email, display_order, is_active, status, seo_title, seo_description, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'published', ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE label = VALUES(label), title = VALUES(title), summary = VALUES(summary), image_url = VALUES(image_url), accent_class_name = VALUES(accent_class_name), stat_value = VALUES(stat_value), stat_label = VALUES(stat_label), detail_eyebrow = VALUES(detail_eyebrow), detail_intro = VALUES(detail_intro), detail_description = VALUES(detail_description), contact_name = VALUES(contact_name), contact_role = VALUES(contact_role), contact_email = VALUES(contact_email), display_order = VALUES(display_order), is_active = TRUE, status = 'published', seo_title = VALUES(seo_title), seo_description = VALUES(seo_description)`,
    values,
  );

  await replaceCategoryRelations(id, input);
}

async function replaceCategoryRelations(categoryId: string, input: PotentialCategoryInput) {
  await executeSql("DELETE FROM potential_highlights WHERE category_id = ?", [categoryId]);
  await executeSql("DELETE FROM potential_opportunities WHERE category_id = ?", [categoryId]);
  await executeSql("DELETE FROM potential_programs WHERE category_id = ?", [categoryId]);
  await executeSql("DELETE FROM potential_gallery_items WHERE category_id = ?", [categoryId]);

  for (const [index, label] of input.highlights.entries()) {
    await executeSql("INSERT INTO potential_highlights (id, category_id, label, display_order) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), categoryId, label, index + 1]);
  }

  for (const [index, description] of input.detail.opportunities.entries()) {
    await executeSql("INSERT INTO potential_opportunities (id, category_id, description, display_order) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), categoryId, description, index + 1]);
  }

  for (const [index, program] of input.detail.programs.entries()) {
    await executeSql("INSERT INTO potential_programs (id, category_id, title, description, display_order) VALUES (?, ?, ?, ?, ?)", [crypto.randomUUID(), categoryId, program.title, program.description, index + 1]);
  }

  for (const [index, item] of input.gallery.entries()) {
    await executeSql("INSERT INTO potential_gallery_items (id, category_id, title, description, image_url, image_alt, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)", [crypto.randomUUID(), categoryId, item.title, item.description, item.image, item.title, index + 1]);
  }
}

async function hydrateSqlCategories(rows: CategoryRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  const values = ids as SqlValue[];
  const highlights = await queryRows<OrderedTextRow>(`SELECT category_id, label AS value_text FROM potential_highlights WHERE category_id IN (${placeholders}) ORDER BY display_order ASC`, values);
  const opportunities = await queryRows<OrderedTextRow>(`SELECT category_id, description AS value_text FROM potential_opportunities WHERE category_id IN (${placeholders}) ORDER BY display_order ASC`, values);
  const programs = await queryRows<ProgramRow>(`SELECT category_id, title, description FROM potential_programs WHERE category_id IN (${placeholders}) ORDER BY display_order ASC`, values);
  const gallery = await queryRows<GalleryRow>(`SELECT category_id, title, description, image_url FROM potential_gallery_items WHERE category_id IN (${placeholders}) ORDER BY display_order ASC`, values);
  const itemGallery = await queryRows<ItemGalleryRow>(
    `SELECT category_id, title, description, image_url
    FROM potential_items
    WHERE category_id IN (${placeholders}) AND status = 'published'
    ORDER BY display_order ASC, published_at DESC, updated_at DESC`,
    values,
  );

  return rows.map((row) => ({
    slug: row.slug,
    label: row.label,
    title: row.title,
    summary: row.summary,
    image: row.image_url,
    detail: {
      eyebrow: row.detail_eyebrow,
      intro: row.detail_intro,
      description: row.detail_description,
      opportunities: opportunities.filter((item) => item.category_id === row.id).map((item) => item.value_text),
      programs: programs.filter((item) => item.category_id === row.id).map((item) => ({ title: item.title, description: item.description })),
      contact: {
        name: row.contact_name,
        role: row.contact_role,
        email: row.contact_email,
      },
    },
    gallery: getSqlCategoryGallery(row.id, itemGallery, gallery),
    stats: { value: row.stat_value, label: row.stat_label },
    highlights: highlights.filter((item) => item.category_id === row.id).map((item) => item.value_text),
    accentClassName: row.accent_class_name,
  } satisfies PotentialCategory));
}

async function hydrateFallbackCategories(categories: PotentialCategory[]) {
  const items = await listPotentialItems();

  return categories.map((category) => ({
    ...category,
    gallery: getFallbackCategoryGallery(category, items),
  }));
}

function getFallbackCategoryGallery(category: PotentialCategory, items: PotentialItemRecord[]) {
  const publishedItems = items
    .filter((item) => item.categorySlug === category.slug && item.status === "published")
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: item.image,
    }));

  return publishedItems.length > 0 ? publishedItems : category.gallery;
}

function getSqlCategoryGallery(categoryId: string, items: ItemGalleryRow[], fallbackGallery: GalleryRow[]) {
  const publishedItems = items
    .filter((item) => item.category_id === categoryId)
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: item.image_url,
    }));

  if (publishedItems.length > 0) {
    return publishedItems;
  }

  return fallbackGallery
    .filter((item) => item.category_id === categoryId)
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: item.image_url,
    }));
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
