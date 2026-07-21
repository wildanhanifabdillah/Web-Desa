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

let newsRecords: AdminNewsRecord[] | null = null;

export async function listAdminNews(filters: {
  query?: string;
  category?: string;
  status?: NewsStatus;
  limit?: number;
} = {}) {
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
  const records = await ensureNewsRecords();

  return records.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export async function createAdminNews(input: AdminNewsInput) {
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






