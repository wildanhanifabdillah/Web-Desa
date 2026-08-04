import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type AdminContentStatus = "draft" | "published" | "archived";

export type AdminGeneralContentBlock = {
  id: string;
  slug: string;
  title: string;
  area: string;
  status: AdminContentStatus;
  updatedAt: string;
  description: string;
  body: string;
};

export type AdminGeneralContentInput = Partial<Omit<AdminGeneralContentBlock, "id" | "updatedAt">> & {
  id?: string;
};

type ContentRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  section: string;
  status: AdminContentStatus;
  updated_at: Date | string;
  body: string;
  metadata: string | { description?: string } | null;
};

export async function createAdminGeneralContentBlock(input: AdminGeneralContentInput) {
  const validation = validateAdminGeneralContentInput(input);

  if (!validation.ok) return validation;
  if (await getAdminGeneralContentBlock(validation.input.slug)) {
    return { ok: false as const, status: 409, error: "Slug konten umum sudah dipakai." };
  }

  const id = input.id?.trim() || crypto.randomUUID();
  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM admin_content_blocks",
  );

  await executeSql(
    `INSERT INTO admin_content_blocks (id, section, title, slug, body, metadata, status, display_order, published_at)
     VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?)`,
    [
      id,
      validation.input.area,
      validation.input.title,
      validation.input.slug,
      validation.input.body,
      JSON.stringify({ description: validation.input.description }),
      validation.input.status,
      orderRows[0]?.next_order ?? 1,
      validation.input.status === "published" ? toMysqlDateTime(new Date().toISOString()) : null,
    ],
  );

  return { ok: true as const, data: await getAdminGeneralContentBlock(id) };
}

export async function updateAdminGeneralContentBlock(idOrSlug: string, input: AdminGeneralContentInput) {
  const current = await getAdminGeneralContentBlock(idOrSlug);

  if (!current) {
    return { ok: false as const, status: 404, error: "Konten umum tidak ditemukan." };
  }

  const validation = validateAdminGeneralContentInput({ ...current, ...input });
  if (!validation.ok) return validation;

  const duplicate = await getAdminGeneralContentBlock(validation.input.slug);
  if (duplicate && duplicate.id !== current.id) {
    return { ok: false as const, status: 409, error: "Slug konten umum sudah dipakai." };
  }

  await executeSql(
    `UPDATE admin_content_blocks
     SET section = ?, title = ?, slug = ?, body = ?, metadata = CAST(? AS JSON), status = ?, published_at = ?
     WHERE id = ?`,
    [
      validation.input.area,
      validation.input.title,
      validation.input.slug,
      validation.input.body,
      JSON.stringify({ description: validation.input.description }),
      validation.input.status,
      validation.input.status === "published" ? toMysqlDateTime(new Date().toISOString()) : null,
      current.id,
    ],
  );

  return { ok: true as const, data: await getAdminGeneralContentBlock(current.id) };
}

export async function deleteAdminGeneralContentBlock(idOrSlug: string) {
  const block = await getAdminGeneralContentBlock(idOrSlug);

  if (!block) return null;
  await executeSql("DELETE FROM admin_content_blocks WHERE id = ?", [block.id]);

  return block;
}

export async function resetAdminGeneralContentBlocks() {
  await executeSql("DELETE FROM admin_content_blocks");

  return listAdminGeneralContentBlocks();
}

export async function listAdminGeneralContentBlocks() {
  const rows = await queryRows<ContentRow>(
    `SELECT id, slug, title, section, status, updated_at, body, metadata
     FROM admin_content_blocks
     ORDER BY display_order ASC, updated_at DESC`,
  );

  return rows.map(mapContentRow);
}

export async function getAdminGeneralContentBlock(idOrSlug: string) {
  const rows = await queryRows<ContentRow>(
    `SELECT id, slug, title, section, status, updated_at, body, metadata
     FROM admin_content_blocks
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ? mapContentRow(rows[0]) : null;
}

export async function searchAdminGeneralContentBlocks({ query, status }: { query?: string; status?: AdminContentStatus }) {
  const blocks = await listAdminGeneralContentBlocks();
  const normalizedQuery = query?.trim().toLowerCase();

  return blocks.filter((block) => {
    const matchesQuery = normalizedQuery
      ? [block.title, block.slug, block.area, block.description, block.body].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const matchesStatus = status ? block.status === status : true;
    return matchesQuery && matchesStatus;
  });
}

export function isAdminContentStatus(value: string | null | undefined): value is AdminContentStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function mapContentRow(row: ContentRow): AdminGeneralContentBlock {
  const metadata = parseMetadata(row.metadata);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    area: row.section,
    status: row.status,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
    description: metadata.description ?? "",
    body: row.body,
  };
}

function parseMetadata(value: ContentRow["metadata"]) {
  if (!value) return {} as { description?: string };
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as { description?: string }; } catch { return {}; }
}

function validateAdminGeneralContentInput(input: AdminGeneralContentInput) {
  const slug = input.slug?.trim();
  const title = input.title?.trim();
  const area = input.area?.trim();
  const description = input.description?.trim();
  const body = input.body?.trim();
  const status = input.status ?? "draft";

  if (!slug || !title || !area || !description || !body) {
    return { ok: false as const, status: 400, error: "Slug, judul, area, deskripsi, dan isi konten wajib diisi." };
  }
  if (!isAdminContentStatus(status)) {
    return { ok: false as const, status: 400, error: "Status konten umum tidak valid." };
  }

  return { ok: true as const, input: { slug, title, area, description, body, status } };
}

function toMysqlDateTime(value: string) {
  return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}
