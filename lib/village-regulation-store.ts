import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";
import type { VillageRegulation } from "@/lib/village-regulations";

export type VillageRegulationInput = Omit<VillageRegulation, "id"> & {
  id?: string;
};

type RegulationRow = RowDataPacket & {
  id: string;
  slug: string;
  regulation_number: string;
  title: string;
  year: number;
  category: string;
  summary: string;
  file_type: string;
  file_size_label: string;
  file_url: string | null;
  status: "active" | "archived";
  enacted_at: Date | string;
  display_order: number;
};

export async function listVillageRegulationRecords() {
  const rows = await queryRows<RegulationRow>(
    `SELECT id, slug, regulation_number, title, year, category, summary,
            file_type, file_size_label, file_url, status, enacted_at, display_order
     FROM village_regulations
     ORDER BY display_order ASC, enacted_at DESC`,
  );

  return rows.map(mapRegulationRow);
}

export async function getVillageRegulationRecord(idOrSlug: string) {
  const row = await getRegulationRow(idOrSlug);

  return row ? mapRegulationRow(row) : null;
}

export async function createVillageRegulationRecord(input: VillageRegulationInput) {
  const normalizedSlug = normalizeSlug(input.slug);

  if (await getVillageRegulationRecord(normalizedSlug)) {
    return null;
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM village_regulations",
  );

  await executeSql(
    `INSERT INTO village_regulations
     (id, slug, regulation_number, title, year, category, summary, file_type,
      file_size_label, file_url, status, enacted_at, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.id?.trim() || crypto.randomUUID(),
      normalizedSlug,
      input.number,
      input.title,
      input.year,
      input.category,
      input.summary,
      input.fileType,
      input.fileSize,
      input.fileUrl ?? null,
      toSqlStatus(input.status),
      toMysqlDateTime(input.enactedAt) ?? new Date(),
      orderRows[0]?.next_order ?? 1,
    ],
  );

  return getVillageRegulationRecord(normalizedSlug);
}

export async function updateVillageRegulationRecord(idOrSlug: string, input: Partial<VillageRegulationInput>) {
  const current = await getRegulationRow(idOrSlug);

  if (!current) {
    return null;
  }

  const existing = mapRegulationRow(current);
  const nextSlug = input.slug ? normalizeSlug(input.slug) : existing.slug;

  if (nextSlug !== existing.slug && await getVillageRegulationRecord(nextSlug)) {
    return null;
  }

  await executeSql(
    `UPDATE village_regulations
     SET slug = ?, regulation_number = ?, title = ?, year = ?, category = ?, summary = ?,
         file_type = ?, file_size_label = ?, file_url = ?, status = ?, enacted_at = ?
     WHERE id = ?`,
    [
      nextSlug,
      input.number ?? existing.number,
      input.title ?? existing.title,
      input.year ?? existing.year,
      input.category ?? existing.category,
      input.summary ?? existing.summary,
      input.fileType ?? existing.fileType,
      input.fileSize ?? existing.fileSize,
      input.fileUrl === undefined ? existing.fileUrl ?? null : input.fileUrl,
      input.status ? toSqlStatus(input.status) : toSqlStatus(existing.status),
      toMysqlDateTime(input.enactedAt ?? existing.enactedAt) ?? new Date(),
      current.id,
    ],
  );

  return getVillageRegulationRecord(nextSlug);
}

export async function deleteVillageRegulationRecord(idOrSlug: string) {
  const record = await getVillageRegulationRecord(idOrSlug);

  if (!record) {
    return null;
  }

  await executeSql("DELETE FROM village_regulations WHERE id = ?", [record.id]);

  return record;
}

export async function resetVillageRegulationRecords() {
  await executeSql("DELETE FROM village_regulations");

  return listVillageRegulationRecords();
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

export function isVillageRegulationStatus(value: unknown): value is VillageRegulation["status"] {
  return value === "Berlaku" || value === "Arsip";
}

async function getRegulationRow(idOrSlug: string) {
  const rows = await queryRows<RegulationRow>(
    `SELECT id, slug, regulation_number, title, year, category, summary,
            file_type, file_size_label, file_url, status, enacted_at, display_order
     FROM village_regulations
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

function mapRegulationRow(row: RegulationRow): VillageRegulation {
  return {
    id: row.id,
    slug: row.slug,
    number: row.regulation_number,
    title: row.title,
    year: Number(row.year),
    category: row.category,
    summary: row.summary,
    fileUrl: row.file_url ?? undefined,
    fileType: row.file_type,
    fileSize: row.file_size_label,
    enactedAt: normalizeSqlDate(row.enacted_at) ?? new Date().toISOString(),
    status: row.status === "active" ? "Berlaku" : "Arsip",
  };
}

function toSqlStatus(status: VillageRegulation["status"]) {
  return status === "Berlaku" ? "active" : "archived";
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
