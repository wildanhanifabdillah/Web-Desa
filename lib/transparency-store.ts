import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";
import type { TransparencyDocument } from "@/lib/transparency";

export type TransparencyDocumentInput = Omit<TransparencyDocument, "id"> & {
  id?: string;
};

type TransparencyRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  file_type: string;
  file_size_label: string;
  file_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: Date | string | null;
  display_order: number;
};

export async function listTransparencyRecords() {
  const rows = await queryRows<TransparencyRow>(
    `SELECT id, slug, title, category, year, description, file_type, file_size_label,
            file_url, status, published_at, display_order
     FROM transparency_documents
     WHERE status <> 'archived'
     ORDER BY display_order ASC, COALESCE(published_at, updated_at) DESC`,
  );

  return rows.map(mapTransparencyRow);
}

export async function getTransparencyRecord(idOrSlug: string) {
  const row = await getTransparencyRow(idOrSlug);

  return row ? mapTransparencyRow(row) : null;
}

export async function createTransparencyRecord(input: TransparencyDocumentInput) {
  const normalizedSlug = normalizeSlug(input.slug);

  if (await getTransparencyRecord(normalizedSlug)) {
    return null;
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM transparency_documents",
  );

  await executeSql(
    `INSERT INTO transparency_documents
     (id, slug, title, category, year, description, file_type, file_size_label, file_url, status, published_at, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id?.trim() || crypto.randomUUID(),
      normalizedSlug,
      input.title,
      input.category,
      input.year,
      input.description?.trim() ?? "",
      input.fileType,
      input.fileSize,
      input.fileUrl ?? null,
      toSqlStatus(input.status),
      toMysqlDateTime(input.publishedAt),
      orderRows[0]?.next_order ?? 1,
    ],
  );

  return getTransparencyRecord(normalizedSlug);
}

export async function updateTransparencyRecord(idOrSlug: string, input: Partial<TransparencyDocumentInput>) {
  const current = await getTransparencyRow(idOrSlug);

  if (!current) {
    return null;
  }

  const existing = mapTransparencyRow(current);
  const nextSlug = input.slug ? normalizeSlug(input.slug) : existing.slug;

  if (nextSlug !== existing.slug && await getTransparencyRecord(nextSlug)) {
    return null;
  }

  await executeSql(
    `UPDATE transparency_documents
     SET slug = ?, title = ?, category = ?, year = ?, description = ?, file_type = ?,
         file_size_label = ?, file_url = ?, status = ?, published_at = ?
     WHERE id = ?`,
    [
      nextSlug,
      input.title ?? existing.title,
      input.category ?? existing.category,
      input.year ?? existing.year,
      input.description === undefined ? existing.description : input.description.trim(),
      input.fileType ?? existing.fileType,
      input.fileSize ?? existing.fileSize,
      input.fileUrl === undefined ? existing.fileUrl ?? null : input.fileUrl,
      input.status ? toSqlStatus(input.status) : toSqlStatus(existing.status),
      toMysqlDateTime(input.publishedAt ?? existing.publishedAt),
      current.id,
    ],
  );

  return getTransparencyRecord(nextSlug);
}

export async function deleteTransparencyRecord(idOrSlug: string) {
  const record = await getTransparencyRecord(idOrSlug);

  if (!record) {
    return null;
  }

  await executeSql("DELETE FROM transparency_documents WHERE id = ?", [record.id]);

  return record;
}

export async function resetTransparencyRecords() {
  await executeSql("DELETE FROM transparency_documents");

  return listTransparencyRecords();
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
    (candidate.description === undefined || typeof candidate.description === "string") &&
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

async function getTransparencyRow(idOrSlug: string) {
  const rows = await queryRows<TransparencyRow>(
    `SELECT id, slug, title, category, year, description, file_type, file_size_label,
            file_url, status, published_at, display_order
     FROM transparency_documents
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

function mapTransparencyRow(row: TransparencyRow): TransparencyDocument {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    year: Number(row.year),
    description: row.description,
    fileType: row.file_type,
    fileSize: row.file_size_label,
    fileUrl: row.file_url ?? undefined,
    publishedAt: normalizeSqlDate(row.published_at) ?? new Date().toISOString(),
    status: row.status === "published" ? "Dipublikasikan" : "Draf",
  };
}

function toSqlStatus(status: TransparencyDocument["status"]) {
  return status === "Dipublikasikan" ? "published" : "draft";
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
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
