import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows, type SqlValue } from "@/lib/db";
import type { GalleryAlbum, GalleryPhoto, GalleryVideo } from "@/lib/gallery";

export type GalleryAlbumInput = Omit<GalleryAlbum, "id" | "photoCount" | "updatedAt"> & {
  id?: string;
  photoCount?: number;
  updatedAt?: string;
};

export type GalleryVideoInput = Omit<GalleryVideo, "id"> & {
  id?: string;
};

type AlbumRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  cover_image_url: string;
  cover_image_alt: string;
  updated_at: Date | string;
};

type PhotoRow = RowDataPacket & {
  id: string;
  album_id: string;
  title: string;
  description: string;
  image_url: string;
  taken_at: Date | string | null;
  display_order: number;
};

type VideoRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  published_at: Date | string | null;
};

export async function listGalleryAlbumRecords() {
  const rows = await queryRows<AlbumRow>(
    `SELECT id, slug, title, category, description, cover_image_url, cover_image_alt, updated_at
     FROM gallery_albums
     WHERE status = 'published'
     ORDER BY display_order ASC, COALESCE(published_at, updated_at) DESC`,
  );

  return hydrateAlbums(rows);
}

export async function getGalleryAlbumRecord(slug: string) {
  const rows = await queryRows<AlbumRow>(
    `SELECT id, slug, title, category, description, cover_image_url, cover_image_alt, updated_at
     FROM gallery_albums
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [slug, slug],
  );
  const albums = await hydrateAlbums(rows);

  return albums[0] ?? null;
}

export async function createGalleryAlbumRecord(input: GalleryAlbumInput) {
  const slug = normalizeSlug(input.slug || input.title);
  const existing = await getGalleryAlbumRecord(slug);

  if (existing || input.id && await getGalleryAlbumRecord(input.id)) {
    return null;
  }

  const id = input.id?.trim() || crypto.randomUUID();
  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM gallery_albums",
  );

  await executeSql(
    `INSERT INTO gallery_albums
     (id, slug, title, category, description, cover_image_url, cover_image_alt, status, published_at, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
    [
      id,
      slug,
      input.title,
      input.category,
      input.description,
      input.coverImage,
      input.title,
      toMysqlDateTime(input.updatedAt ?? new Date().toISOString()),
      orderRows[0]?.next_order ?? 1,
    ],
  );
  await replaceAlbumPhotos(id, normalizePhotos(input.photos));

  return getGalleryAlbumRecord(slug);
}

export async function updateGalleryAlbumRecord(idOrSlug: string, input: Partial<GalleryAlbumInput>) {
  const current = await getAlbumRow(idOrSlug);

  if (!current) {
    return null;
  }

  const existingAlbum = (await hydrateAlbums([current]))[0];
  const nextSlug = input.slug ? normalizeSlug(input.slug) : existingAlbum.slug;

  if (nextSlug !== existingAlbum.slug && await getGalleryAlbumRecord(nextSlug)) {
    return null;
  }

  const updatedAt = new Date().toISOString();

  await executeSql(
    `UPDATE gallery_albums
     SET slug = ?, title = ?, category = ?, description = ?, cover_image_url = ?, cover_image_alt = ?, published_at = ?
     WHERE id = ?`,
    [
      nextSlug,
      input.title ?? existingAlbum.title,
      input.category ?? existingAlbum.category,
      input.description ?? existingAlbum.description,
      input.coverImage ?? existingAlbum.coverImage,
      input.title ?? existingAlbum.title,
      toMysqlDateTime(updatedAt),
      current.id,
    ],
  );

  if (input.photos) {
    await replaceAlbumPhotos(current.id, normalizePhotos(input.photos));
  }

  return getGalleryAlbumRecord(nextSlug);
}

export async function deleteGalleryAlbumRecord(idOrSlug: string) {
  const album = await getGalleryAlbumRecord(idOrSlug);

  if (!album) {
    return null;
  }

  await executeSql("DELETE FROM gallery_albums WHERE id = ?", [album.id]);

  return album;
}

export async function resetGalleryAlbumRecords() {
  await executeSql("DELETE FROM gallery_albums");

  return listGalleryAlbumRecords();
}

export async function listGalleryVideoRecords() {
  const rows = await queryRows<VideoRow>(
    `SELECT id, slug, title, description, thumbnail_url, duration_seconds, published_at
     FROM gallery_videos
     WHERE status = 'published'
     ORDER BY display_order ASC, COALESCE(published_at, updated_at) DESC`,
  );

  return rows.map(mapVideoRow);
}

export async function getGalleryVideoRecord(id: string) {
  const rows = await queryRows<VideoRow>(
    `SELECT id, slug, title, description, thumbnail_url, duration_seconds, published_at
     FROM gallery_videos
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [id, id],
  );

  return rows[0] ? mapVideoRow(rows[0]) : null;
}

export async function createGalleryVideoRecord(input: GalleryVideoInput) {
  const slug = normalizeSlug(input.id?.trim() || input.title);

  if (await getGalleryVideoRecord(slug)) {
    return null;
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM gallery_videos",
  );

  await executeSql(
    `INSERT INTO gallery_videos
     (id, slug, title, description, thumbnail_url, thumbnail_alt, duration_seconds, status, published_at, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
    [
      crypto.randomUUID(),
      slug,
      input.title,
      input.description,
      input.thumbnail,
      input.title,
      parseDuration(input.duration),
      toMysqlDateTime(input.publishedAt),
      orderRows[0]?.next_order ?? 1,
    ],
  );

  return getGalleryVideoRecord(slug);
}

export async function updateGalleryVideoRecord(id: string, input: Partial<GalleryVideoInput>) {
  const current = await getVideoRow(id);

  if (!current) {
    return null;
  }

  const existing = mapVideoRow(current);
  const nextSlug = input.id ? normalizeSlug(input.id) : current.slug;

  if (nextSlug !== current.slug && await getGalleryVideoRecord(nextSlug)) {
    return null;
  }

  await executeSql(
    `UPDATE gallery_videos
     SET slug = ?, title = ?, description = ?, thumbnail_url = ?, thumbnail_alt = ?, duration_seconds = ?, published_at = ?
     WHERE id = ?`,
    [
      nextSlug,
      input.title ?? existing.title,
      input.description ?? existing.description,
      input.thumbnail ?? existing.thumbnail,
      input.title ?? existing.title,
      parseDuration(input.duration ?? existing.duration),
      toMysqlDateTime(input.publishedAt ?? existing.publishedAt),
      current.id,
    ],
  );

  return getGalleryVideoRecord(nextSlug);
}

export async function deleteGalleryVideoRecord(id: string) {
  const video = await getGalleryVideoRecord(id);

  if (!video) {
    return null;
  }

  const current = await getVideoRow(id);
  await executeSql("DELETE FROM gallery_videos WHERE id = ?", [current?.id ?? id]);

  return video;
}

export async function resetGalleryVideoRecords() {
  await executeSql("DELETE FROM gallery_videos");

  return listGalleryVideoRecords();
}

export function isGalleryAlbumInput(value: unknown): value is GalleryAlbumInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryAlbumInput>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.category === "string" &&
    candidate.category.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.coverImage === "string" &&
    candidate.coverImage.trim().length > 0 &&
    Array.isArray(candidate.photos) &&
    candidate.photos.every(isGalleryPhoto)
  );
}

export function isGalleryVideoInput(value: unknown): value is GalleryVideoInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryVideoInput>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.thumbnail === "string" &&
    candidate.thumbnail.trim().length > 0 &&
    typeof candidate.duration === "string" &&
    candidate.duration.trim().length > 0 &&
    typeof candidate.publishedAt === "string" &&
    candidate.publishedAt.trim().length > 0
  );
}

export async function createGalleryPhotoRecord(albumSlug: string, input: Omit<GalleryPhoto, "id"> & { id?: string }) {
  const albumRow = await getAlbumRow(albumSlug);

  if (!albumRow) {
    return null;
  }

  const photo: GalleryPhoto = {
    id: input.id?.trim() || crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    image: input.image.trim(),
    takenAt: input.takenAt.trim(),
  };
  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM gallery_photos WHERE album_id = ?",
    [albumRow.id],
  );

  await executeSql(
    `INSERT INTO gallery_photos
     (id, album_id, title, description, image_url, image_alt, taken_at, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [photo.id, albumRow.id, photo.title, photo.description, photo.image, photo.title, toMysqlDateTime(photo.takenAt), orderRows[0]?.next_order ?? 1],
  );

  return { album: await getGalleryAlbumRecord(albumRow.slug), photo };
}

export async function updateGalleryPhotoRecord(albumSlug: string, photoId: string, input: Partial<GalleryPhoto>) {
  const albumRow = await getAlbumRow(albumSlug);

  if (!albumRow) {
    return null;
  }

  const rows = await queryRows<PhotoRow>(
    `SELECT id, album_id, title, description, image_url, taken_at, display_order
     FROM gallery_photos
     WHERE album_id = ? AND id = ?
     LIMIT 1`,
    [albumRow.id, photoId],
  );
  const current = rows[0];

  if (!current) {
    return null;
  }

  const existingPhoto = mapPhotoRow(current);
  const updatedPhoto: GalleryPhoto = {
    ...existingPhoto,
    ...input,
    id: existingPhoto.id,
    title: input.title?.trim() ?? existingPhoto.title,
    description: input.description?.trim() ?? existingPhoto.description,
    image: input.image?.trim() ?? existingPhoto.image,
    takenAt: input.takenAt?.trim() ?? existingPhoto.takenAt,
  };

  if (!isGalleryPhoto(updatedPhoto)) {
    return null;
  }

  await executeSql(
    "UPDATE gallery_photos SET title = ?, description = ?, image_url = ?, image_alt = ?, taken_at = ? WHERE id = ?",
    [updatedPhoto.title, updatedPhoto.description, updatedPhoto.image, updatedPhoto.title, toMysqlDateTime(updatedPhoto.takenAt), current.id],
  );

  return { album: await getGalleryAlbumRecord(albumRow.slug), photo: updatedPhoto };
}

export async function deleteGalleryPhotoRecord(albumSlug: string, photoId: string) {
  const albumRow = await getAlbumRow(albumSlug);

  if (!albumRow) {
    return null;
  }

  const rows = await queryRows<PhotoRow>(
    `SELECT id, album_id, title, description, image_url, taken_at, display_order
     FROM gallery_photos
     WHERE album_id = ? AND id = ?
     LIMIT 1`,
    [albumRow.id, photoId],
  );
  const current = rows[0];

  if (!current) {
    return null;
  }

  const photo = mapPhotoRow(current);
  await executeSql("DELETE FROM gallery_photos WHERE id = ?", [current.id]);

  return { album: await getGalleryAlbumRecord(albumRow.slug), photo };
}

async function getAlbumRow(idOrSlug: string) {
  const rows = await queryRows<AlbumRow>(
    `SELECT id, slug, title, category, description, cover_image_url, cover_image_alt, updated_at
     FROM gallery_albums
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

async function getVideoRow(idOrSlug: string) {
  const rows = await queryRows<VideoRow>(
    `SELECT id, slug, title, description, thumbnail_url, duration_seconds, published_at
     FROM gallery_videos
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

async function hydrateAlbums(rows: AlbumRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  const photos = await queryRows<PhotoRow>(
    `SELECT id, album_id, title, description, image_url, taken_at, display_order
     FROM gallery_photos
     WHERE album_id IN (${placeholders})
     ORDER BY display_order ASC, taken_at DESC`,
    ids as SqlValue[],
  );
  const photosByAlbum = new Map<string, GalleryPhoto[]>();

  for (const photo of photos) {
    const current = photosByAlbum.get(photo.album_id) ?? [];
    current.push(mapPhotoRow(photo));
    photosByAlbum.set(photo.album_id, current);
  }

  return rows.map((row) => {
    const albumPhotos = photosByAlbum.get(row.id) ?? [];

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      description: row.description,
      coverImage: row.cover_image_url,
      photoCount: albumPhotos.length,
      updatedAt: normalizeSqlDate(row.updated_at) ?? new Date().toISOString(),
      photos: albumPhotos,
    };
  });
}

async function replaceAlbumPhotos(albumId: string, photos: GalleryPhoto[]) {
  await executeSql("DELETE FROM gallery_photos WHERE album_id = ?", [albumId]);

  for (const [index, photo] of photos.entries()) {
    await executeSql(
      `INSERT INTO gallery_photos
       (id, album_id, title, description, image_url, image_alt, taken_at, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [photo.id, albumId, photo.title, photo.description, photo.image, photo.title, toMysqlDateTime(photo.takenAt), index + 1],
    );
  }
}

function mapPhotoRow(row: PhotoRow): GalleryPhoto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image_url,
    takenAt: normalizeSqlDate(row.taken_at) ?? new Date().toISOString(),
  };
}

function mapVideoRow(row: VideoRow): GalleryVideo {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail_url,
    duration: formatDuration(row.duration_seconds),
    publishedAt: normalizeSqlDate(row.published_at) ?? new Date().toISOString(),
  };
}

function normalizePhotos(photos: GalleryPhoto[]) {
  return photos.map((photo) => ({
    id: photo.id?.trim() || crypto.randomUUID(),
    title: photo.title.trim(),
    description: photo.description.trim(),
    image: photo.image.trim(),
    takenAt: photo.takenAt.trim() || new Date().toISOString(),
  }));
}

function isGalleryPhoto(value: unknown): value is GalleryPhoto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GalleryPhoto>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    typeof candidate.image === "string" &&
    candidate.image.trim().length > 0 &&
    typeof candidate.takenAt === "string" &&
    candidate.takenAt.trim().length > 0
  );
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseDuration(value: string) {
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));

  if (parts.length === 2 && parts.every(Number.isFinite)) {
    return parts[0] * 60 + parts[1];
  }

  return null;
}

function formatDuration(value: number | null) {
  if (!value || value < 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
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
