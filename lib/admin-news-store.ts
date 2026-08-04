import type { RowDataPacket } from "mysql2";
import { executeSql, isDatabaseConfigured, queryRows, type SqlValue } from "@/lib/db";
import { getLatestNews, type LatestNewsItem } from "@/lib/latest-news";
import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";
import type { NewsStatus } from "@/lib/news-model";

export type AdminNewsGalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  order: number;
  uploadedAt: string;
};

export type AdminNewsRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  galleryImages: AdminNewsGalleryImage[];
  publishedAt: string | null;
  authorName: string;
  isAiGenerated: boolean;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsInput = Partial<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  galleryImages: AdminNewsGalleryImage[];
  publishedAt: string | null;
  authorName: string;
  isAiGenerated: boolean;
  status: NewsStatus;
}>;

export type AdminNewsDraftInput = {
  topic: string;
  category: string;
  instruction?: string;
  authorName?: string;
};

type NewsSqlRow = RowDataPacket & {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_image_alt: string;
  gallery_images: string | AdminNewsGalleryImage[] | null;
  category: string;
  author_name: string;
  is_ai_generated: 0 | 1 | boolean;
  status: NewsStatus;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

let newsRecords: AdminNewsRecord[] | null = null;

export async function listAdminNews(filters: {
  query?: string;
  category?: string;
  status?: NewsStatus;
  limit?: number;
} = {}) {
  if (isDatabaseConfigured()) {
    return listAdminNewsFromSql(filters);
  }

  const records = await ensureNewsRecords();
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const normalizedCategory = filters.category?.trim().toLowerCase();

  const filteredRecords = records.filter((item) => {
    const matchesQuery = normalizedQuery
      ? [
          item.title,
          item.slug,
          item.excerpt,
          item.content,
          item.category,
          item.authorName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesCategory = normalizedCategory
      ? item.category.toLowerCase() === normalizedCategory
      : true;
    const matchesStatus = filters.status ? item.status === filters.status : true;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return typeof filters.limit === "number"
    ? filteredRecords.slice(0, filters.limit)
    : filteredRecords;
}

export async function getAdminNews(idOrSlug: string) {
  if (isDatabaseConfigured()) {
    return getAdminNewsFromSql(idOrSlug);
  }

  const records = await ensureNewsRecords();

  return records.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export async function createAdminNews(input: AdminNewsInput) {
  if (isDatabaseConfigured()) {
    return createAdminNewsInSql(input);
  }

  const records = await ensureNewsRecords();
  const validation = validateAdminNewsInput(input, { requireContent: true });

  if (!validation.ok) {
    return validation;
  }

  if (records.some((item) => item.slug === validation.input.slug)) {
    return {
      ok: false as const,
      status: 409,
      error: "Slug berita sudah dipakai.",
    };
  }

  const now = new Date().toISOString();
  const record: AdminNewsRecord = {
    id: crypto.randomUUID(),
    ...validation.input,
    publishedAt: validation.input.publishedAt ?? (validation.input.status === "published" ? now : null),
    galleryImages: validation.input.galleryImages ?? [],
    isAiGenerated: validation.input.isAiGenerated ?? false,
    status: validation.input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  records.unshift(record);
  saveNewsRecords(records);

  return { ok: true as const, data: record };
}

export async function updateAdminNews(idOrSlug: string, input: AdminNewsInput) {
  if (isDatabaseConfigured()) {
    return updateAdminNewsInSql(idOrSlug, input);
  }

  const records = await ensureNewsRecords();
  const index = records.findIndex((item) => item.id === idOrSlug || item.slug === idOrSlug);

  if (index < 0) {
    return {
      ok: false as const,
      status: 404,
      error: "Berita tidak ditemukan.",
    };
  }

  const current = records[index];
  const merged: AdminNewsInput = {
    ...current,
    ...input,
    galleryImages: input.galleryImages
      ? [...(current.galleryImages ?? []), ...input.galleryImages]
      : current.galleryImages ?? [],
  };
  const validation = validateAdminNewsInput(merged, { requireContent: true });

  if (!validation.ok) {
    return validation;
  }

  const duplicateSlug = records.some(
    (item) => item.slug === validation.input.slug && item.id !== current.id,
  );

  if (duplicateSlug) {
    return {
      ok: false as const,
      status: 409,
      error: "Slug berita sudah dipakai.",
    };
  }

  const updated: AdminNewsRecord = {
    ...current,
    ...validation.input,
    publishedAt: validation.input.publishedAt ?? current.publishedAt,
    isAiGenerated: validation.input.isAiGenerated ?? current.isAiGenerated,
    status: validation.input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  saveNewsRecords(records);

  return { ok: true as const, data: updated };
}

export async function deleteAdminNews(idOrSlug: string) {
  if (isDatabaseConfigured()) {
    return deleteAdminNewsFromSql(idOrSlug);
  }

  const records = await ensureNewsRecords();
  const index = records.findIndex((item) => item.id === idOrSlug || item.slug === idOrSlug);

  if (index < 0) {
    return null;
  }

  const [deleted] = records.splice(index, 1);
  saveNewsRecords(records);

  return deleted;
}

export async function resetAdminNews() {
  if (isDatabaseConfigured()) {
    const records = await getInitialNewsRecords();
    await executeSql("DELETE FROM berita");

    for (const record of records) {
      await insertAdminNewsSql(record);
    }

    return records;
  }

  newsRecords = resetJsonFile("admin-news.json", await getInitialNewsRecords());

  return newsRecords ?? [];
}

export function generateAdminNewsDraft(input: AdminNewsDraftInput) {
  const topic = input.topic.trim();
  const category = input.category.trim();
  const instruction = input.instruction?.trim();

  if (topic.length < 5 || category.length < 3) {
    return {
      ok: false as const,
      status: 400,
      error: "Topik minimal 5 karakter dan kategori minimal 3 karakter.",
    };
  }

  const title = titleCase(`${topic} di Desa Keseneng`);
  const slug = slugify(title);
  const excerpt = `${topic} menjadi bahan informasi warga Desa Keseneng dalam kategori ${category}.`;
  const content = [
    `${title}. Pemerintah Desa Keseneng menyiapkan informasi ini agar warga mendapat kabar yang jelas dan mudah dipahami.`,
    `Draft ini menyoroti konteks ${category.toLowerCase()}, pihak yang terlibat, manfaat untuk warga, dan tindak lanjut yang perlu diketahui publik.`,
    instruction
      ? `Arahan redaksi: ${instruction}`
      : "Admin dapat melengkapi kutipan narasumber, waktu kegiatan, lokasi, dan data pendukung sebelum dipublikasikan.",
  ].join("\n\n");

  return {
    ok: true as const,
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      imageUrl: "/images/berita/informasi-publik.jpg",
      imageAlt: `Ilustrasi berita ${category} Desa Keseneng`,
      galleryImages: [],
      authorName: input.authorName?.trim() || "Admin Desa Keseneng",
      isAiGenerated: true,
      status: "draft" as NewsStatus,
      publishedAt: null,
    },
  };
}

export function isNewsStatus(value: string | null | undefined): value is NewsStatus {
  return value === "draft" || value === "published" || value === "archived";
}

async function ensureNewsRecords() {
  if (!newsRecords) {
    newsRecords = loadJsonFile("admin-news.json", await getInitialNewsRecords());
  }

  return newsRecords ?? [];
}


async function listAdminNewsFromSql(filters: {
  query?: string;
  category?: string;
  status?: NewsStatus;
  limit?: number;
} = {}) {
  const where: string[] = [];
  const values: SqlValue[] = [];
  const normalizedQuery = filters.query?.trim();
  const normalizedCategory = filters.category?.trim();

  if (normalizedQuery) {
    where.push("(title LIKE ? OR slug LIKE ? OR excerpt LIKE ? OR content LIKE ? OR category LIKE ? OR author_name LIKE ?)");
    const likeValue = `%${normalizedQuery}%`;
    values.push(likeValue, likeValue, likeValue, likeValue, likeValue, likeValue);
  }

  if (normalizedCategory) {
    where.push("LOWER(category) = LOWER(?)");
    values.push(normalizedCategory);
  }

  if (filters.status) {
    where.push("status = ?");
    values.push(filters.status);
  }

  const limitSql = typeof filters.limit === "number" ? " LIMIT ?" : "";

  if (typeof filters.limit === "number") {
    values.push(filters.limit);
  }

  const rows = await queryRows<NewsSqlRow>(
    `SELECT * FROM berita${where.length > 0 ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY COALESCE(published_at, updated_at) DESC, updated_at DESC${limitSql}`,
    values,
  );

  return rows.map(mapNewsSqlRow);
}

async function getAdminNewsFromSql(idOrSlug: string) {
  const rows = await queryRows<NewsSqlRow>("SELECT * FROM berita WHERE id = ? OR slug = ? LIMIT 1", [idOrSlug, idOrSlug]);

  return rows[0] ? mapNewsSqlRow(rows[0]) : null;
}

async function createAdminNewsInSql(input: AdminNewsInput) {
  const validation = validateAdminNewsInput(input, { requireContent: true });

  if (!validation.ok) {
    return validation;
  }

  const existing = await getAdminNewsFromSql(validation.input.slug);

  if (existing) {
    return { ok: false as const, status: 409, error: "Slug berita sudah dipakai." };
  }

  const now = new Date().toISOString();
  const record: AdminNewsRecord = {
    id: crypto.randomUUID(),
    ...validation.input,
    publishedAt: validation.input.publishedAt ?? (validation.input.status === "published" ? now : null),
    galleryImages: validation.input.galleryImages ?? [],
    isAiGenerated: validation.input.isAiGenerated ?? false,
    status: validation.input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  await insertAdminNewsSql(record);

  return { ok: true as const, data: record };
}

async function updateAdminNewsInSql(idOrSlug: string, input: AdminNewsInput) {
  const current = await getAdminNewsFromSql(idOrSlug);

  if (!current) {
    return { ok: false as const, status: 404, error: "Berita tidak ditemukan." };
  }

  const merged: AdminNewsInput = {
    ...current,
    ...input,
    galleryImages: input.galleryImages
      ? [...(current.galleryImages ?? []), ...input.galleryImages]
      : current.galleryImages ?? [],
  };
  const validation = validateAdminNewsInput(merged, { requireContent: true });

  if (!validation.ok) {
    return validation;
  }

  const duplicate = await queryRows<NewsSqlRow>(
    "SELECT id FROM berita WHERE slug = ? AND id <> ? LIMIT 1",
    [validation.input.slug, current.id],
  );

  if (duplicate.length > 0) {
    return { ok: false as const, status: 409, error: "Slug berita sudah dipakai." };
  }

  const updated: AdminNewsRecord = {
    ...current,
    ...validation.input,
    publishedAt: validation.input.publishedAt ?? current.publishedAt,
    isAiGenerated: validation.input.isAiGenerated ?? current.isAiGenerated,
    status: validation.input.status ?? current.status,
    updatedAt: new Date().toISOString(),
  };

  await executeSql(
    `UPDATE berita SET
      title = ?,
      slug = ?,
      excerpt = ?,
      content = ?,
      cover_image_url = ?,
      cover_image_alt = ?,
      gallery_images = CAST(? AS JSON),
      category = ?,
      author_name = ?,
      is_ai_generated = ?,
      status = ?,
      published_at = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      updated.title,
      updated.slug,
      updated.excerpt,
      updated.content,
      updated.imageUrl,
      updated.imageAlt,
      JSON.stringify(updated.galleryImages ?? []),
      updated.category,
      updated.authorName,
      updated.isAiGenerated ? 1 : 0,
      updated.status,
      toMysqlDateTime(updated.publishedAt),
      toMysqlDateTime(updated.updatedAt),
      updated.id,
    ],
  );

  return { ok: true as const, data: updated };
}

async function deleteAdminNewsFromSql(idOrSlug: string) {
  const current = await getAdminNewsFromSql(idOrSlug);

  if (!current) {
    return null;
  }

  await executeSql("DELETE FROM berita WHERE id = ?", [current.id]);

  return current;
}

async function insertAdminNewsSql(record: AdminNewsRecord) {
  await executeSql(
    `INSERT INTO berita (
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      cover_image_alt,
      gallery_images,
      category,
      author_name,
      is_ai_generated,
      status,
      published_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.title,
      record.slug,
      record.excerpt,
      record.content,
      record.imageUrl,
      record.imageAlt,
      JSON.stringify(record.galleryImages ?? []),
      record.category,
      record.authorName,
      record.isAiGenerated ? 1 : 0,
      record.status,
      toMysqlDateTime(record.publishedAt),
      toMysqlDateTime(record.createdAt),
      toMysqlDateTime(record.updatedAt),
    ],
  );
}

function mapNewsSqlRow(row: NewsSqlRow): AdminNewsRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    imageUrl: row.cover_image_url,
    imageAlt: row.cover_image_alt,
    galleryImages: parseGalleryImages(row.gallery_images),
    publishedAt: normalizeSqlDate(row.published_at),
    authorName: row.author_name,
    isAiGenerated: Boolean(row.is_ai_generated),
    status: row.status,
    createdAt: normalizeSqlDate(row.created_at) ?? new Date().toISOString(),
    updatedAt: normalizeSqlDate(row.updated_at) ?? new Date().toISOString(),
  };
}

function parseGalleryImages(value: NewsSqlRow["gallery_images"]): AdminNewsGalleryImage[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return normalizeGalleryImages(value);
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? normalizeGalleryImages(parsed as AdminNewsGalleryImage[]) : [];
  } catch {
    return [];
  }
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

async function getInitialNewsRecords() {
  const latestNews = await getLatestNews();

  return latestNews.map(mapLatestNewsToAdminRecord);
}

function saveNewsRecords(records: AdminNewsRecord[]) {
  newsRecords = records;
  saveJsonFile("admin-news.json", records);
}

function mapLatestNewsToAdminRecord(item: LatestNewsItem): AdminNewsRecord {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: `${item.excerpt}\n\nKonten lengkap berita ini dapat diperbarui oleh admin desa melalui panel pengelolaan berita.`,
    category: item.category,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    publishedAt: item.publishedAt,
    authorName: item.authorName,
    galleryImages: [],
    isAiGenerated: false,
    status: "published",
    createdAt: item.publishedAt,
    updatedAt: item.publishedAt,
  };
}

function validateAdminNewsInput(
  input: AdminNewsInput,
  options: { requireContent?: boolean } = {},
) {
  const title = input.title?.trim() ?? "";
  const slug = input.slug?.trim() || slugify(title);
  const excerpt = input.excerpt?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  const category = input.category?.trim() ?? "";
  const authorName = input.authorName?.trim() || "Admin Desa Keseneng";
  const imageUrl = input.imageUrl?.trim() || "/images/berita/informasi-publik.jpg";
  const imageAlt = input.imageAlt?.trim() || `Ilustrasi berita ${category || "desa"}`;
  const galleryImages = normalizeGalleryImages(input.galleryImages);

  if (title.length < 5) {
    return { ok: false as const, status: 400, error: "Judul berita minimal 5 karakter." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false as const,
      status: 400,
      error: "Slug berita hanya boleh huruf kecil, angka, dan tanda hubung.",
    };
  }

  if (excerpt.length < 20) {
    return { ok: false as const, status: 400, error: "Ringkasan berita minimal 20 karakter." };
  }

  if (options.requireContent && content.length < 30) {
    return { ok: false as const, status: 400, error: "Konten berita minimal 30 karakter." };
  }

  if (category.length < 3) {
    return { ok: false as const, status: 400, error: "Kategori berita minimal 3 karakter." };
  }

  if (input.status && !isNewsStatus(input.status)) {
    return { ok: false as const, status: 400, error: "Status berita tidak valid." };
  }

  return {
    ok: true as const,
    input: {
      title,
      slug,
      excerpt,
      content,
      category,
      imageUrl,
      imageAlt,
      galleryImages,
      publishedAt: input.publishedAt ?? null,
      authorName,
      isAiGenerated: input.isAiGenerated,
      status: input.status,
    },
  };
}

function normalizeGalleryImages(value: AdminNewsInput["galleryImages"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is AdminNewsGalleryImage => {
      return Boolean(item && typeof item.url === "string" && item.url.trim().length > 0);
    })
    .map((item, index) => ({
      id: item.id?.trim() || crypto.randomUUID(),
      url: item.url.trim(),
      alt: item.alt?.trim() || "Foto berita Desa Keseneng",
      caption: item.caption?.trim() || "",
      order: Number.isFinite(item.order) ? item.order : index + 1,
      uploadedAt: item.uploadedAt || new Date().toISOString(),
    }))
    .sort((left, right) => left.order - right.order);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}






