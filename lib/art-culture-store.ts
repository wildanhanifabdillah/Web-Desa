import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type ArtCultureStatus = "active" | "draft" | "archived";

export type ArtTypeRecord = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  history: string;
  imageUrl: string;
  imageAlt: string;
  displayOrder: number;
  status: ArtCultureStatus;
  updatedAt: string;
};

export type ArtGroupRecord = {
  id: string;
  slug: string;
  name: string;
  artTypeIds: string[];
  foundedHistory: string;
  performanceManagement: string;
  memberCount: number;
  tariffMin: number;
  tariffMax: number;
  contactName: string;
  contactPhone: string;
  imageUrl: string;
  imageAlt: string;
  displayOrder: number;
  status: ArtCultureStatus;
  updatedAt: string;
};

export type ArtTypeInput = Omit<ArtTypeRecord, "id" | "updatedAt">;
export type ArtGroupInput = Omit<ArtGroupRecord, "id" | "updatedAt">;

type SettingsRow = RowDataPacket & { setting_value: string | unknown };

const typesKey = "art_culture_types";
const groupsKey = "art_culture_groups";
const publicArtTypeSlugs = new Set(["lengger", "jaran-kepang"]);

const initialArtTypes: ArtTypeRecord[] = [
  {
    id: "lengger",
    slug: "lengger",
    name: "Lengger",
    summary: "Seni tari tradisional yang menjadi identitas budaya warga Keseneng.",
    description: "Lengger ditampilkan dalam kegiatan adat, hiburan warga, dan agenda budaya desa dengan dukungan kelompok seni lokal.",
    history: "Tradisi Lengger tumbuh dari ruang latihan warga dan diwariskan melalui keterlibatan lintas generasi.",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pementasan seni tari tradisional",
    displayOrder: 1,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "jaran-kepang",
    slug: "jaran-kepang",
    name: "Jaran Kepang",
    summary: "Pertunjukan rakyat dengan unsur tari, musik, dan kekompakan paguyuban.",
    description: "Jaran Kepang menjadi salah satu kesenian yang sering ditampilkan dalam hajatan, kegiatan desa, dan perayaan budaya.",
    history: "Kesenian ini berkembang melalui paguyuban warga yang menjaga pola latihan, perlengkapan, dan regenerasi pemain.",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Pertunjukan budaya rakyat",
    displayOrder: 2,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

const initialArtGroups: ArtGroupRecord[] = [
  {
    id: "bws",
    slug: "bws",
    name: "BWS",
    artTypeIds: [],
    foundedHistory: "Paguyuban BWS berkembang dari inisiatif warga untuk menjaga pertunjukan rakyat dan membuka ruang latihan bagi generasi muda.",
    performanceManagement: "Manajemen pertunjukan dikelola melalui koordinator kelompok, jadwal latihan, perlengkapan pentas, dan komunikasi pemesan acara.",
    memberCount: 45,
    tariffMin: 5000000,
    tariffMax: 8000000,
    contactName: "Pengurus BWS",
    contactPhone: "",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Paguyuban seni BWS Desa Keseneng",
    displayOrder: 1,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "rms",
    slug: "rms",
    name: "RMS",
    artTypeIds: [],
    foundedHistory: "RMS menjadi wadah seni warga untuk mengelola latihan dan dokumentasi pertunjukan budaya.",
    performanceManagement: "Kelompok mengatur pemain, perlengkapan musik, dan kebutuhan acara secara kolektif.",
    memberCount: 32,
    tariffMin: 3000000,
    tariffMax: 6000000,
    contactName: "Pengurus RMS",
    contactPhone: "",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Kelompok seni RMS Desa Keseneng",
    displayOrder: 2,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "krido-budoyo",
    slug: "krido-budoyo",
    name: "Krido Budoyo",
    artTypeIds: [],
    foundedHistory: "Krido Budoyo bergerak sebagai kelompok pelestari seni yang aktif dalam kegiatan desa dan hajatan warga.",
    performanceManagement: "Pengurus kelompok menyiapkan jadwal tampil, kebutuhan properti, dan pendampingan anggota muda.",
    memberCount: 38,
    tariffMin: 4000000,
    tariffMax: 7500000,
    contactName: "Pengurus Krido Budoyo",
    contactPhone: "",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Kelompok seni Krido Budoyo Desa Keseneng",
    displayOrder: 3,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

export async function listArtTypes(status?: ArtCultureStatus) {
  return (await loadRecords<ArtTypeRecord>(typesKey, initialArtTypes))
    .filter((item) => publicArtTypeSlugs.has(item.slug))
    .filter((item) => status ? item.status === status : true)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export async function listArtGroups(status?: ArtCultureStatus) {
  return (await loadRecords<ArtGroupRecord>(groupsKey, initialArtGroups))
    .filter((item) => status ? item.status === status : true)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export async function getArtType(idOrSlug: string) {
  return (await loadRecords<ArtTypeRecord>(typesKey, initialArtTypes)).find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export async function getArtGroup(idOrSlug: string) {
  return (await loadRecords<ArtGroupRecord>(groupsKey, initialArtGroups)).find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export async function createArtType(input: ArtTypeInput) {
  const records = await loadRecords<ArtTypeRecord>(typesKey, initialArtTypes);
  const slug = normalizeSlug(input.slug || input.name);

  if (records.some((item) => item.slug === slug || item.id === slug)) {
    return null;
  }

  const record: ArtTypeRecord = { ...input, id: slug, slug, updatedAt: new Date().toISOString() };
  await saveRecords(typesKey, [...records, record]);

  return record;
}

export async function updateArtType(idOrSlug: string, input: Partial<ArtTypeInput>) {
  const records = await loadRecords<ArtTypeRecord>(typesKey, initialArtTypes);
  const existing = records.find((item) => item.id === idOrSlug || item.slug === idOrSlug);

  if (!existing) {
    return null;
  }

  const record: ArtTypeRecord = {
    ...existing,
    ...input,
    id: existing.id,
    slug: input.slug ? normalizeSlug(input.slug) : existing.slug,
    updatedAt: new Date().toISOString(),
  };
  await saveRecords(typesKey, records.map((item) => item.id === existing.id ? record : item));

  return record;
}

export async function deleteArtType(idOrSlug: string) {
  return updateArtType(idOrSlug, { status: "archived" });
}

export async function createArtGroup(input: ArtGroupInput) {
  const records = await loadRecords<ArtGroupRecord>(groupsKey, initialArtGroups);
  const slug = normalizeSlug(input.slug || input.name);

  if (records.some((item) => item.slug === slug || item.id === slug)) {
    return null;
  }

  const record: ArtGroupRecord = { ...input, id: slug, slug, artTypeIds: normalizeArtTypeIds(input.artTypeIds), updatedAt: new Date().toISOString() };
  await saveRecords(groupsKey, [...records, record]);

  return record;
}

export async function updateArtGroup(idOrSlug: string, input: Partial<ArtGroupInput>) {
  const records = await loadRecords<ArtGroupRecord>(groupsKey, initialArtGroups);
  const existing = records.find((item) => item.id === idOrSlug || item.slug === idOrSlug);

  if (!existing) {
    return null;
  }

  const record: ArtGroupRecord = {
    ...existing,
    ...input,
    id: existing.id,
    slug: input.slug ? normalizeSlug(input.slug) : existing.slug,
    artTypeIds: input.artTypeIds ? normalizeArtTypeIds(input.artTypeIds) : existing.artTypeIds,
    updatedAt: new Date().toISOString(),
  };
  await saveRecords(groupsKey, records.map((item) => item.id === existing.id ? record : item));

  return record;
}

export async function deleteArtGroup(idOrSlug: string) {
  return updateArtGroup(idOrSlug, { status: "archived" });
}

export async function resetArtCultureRecords() {
  await saveRecords(typesKey, initialArtTypes);
  await saveRecords(groupsKey, initialArtGroups);

  return { types: initialArtTypes, groups: initialArtGroups };
}

export function isArtTypeInput(value: unknown): value is ArtTypeInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ArtTypeInput>;
  return typeof candidate.slug === "string" && typeof candidate.name === "string" && candidate.name.trim().length > 0 && typeof candidate.summary === "string" && candidate.summary.trim().length > 0 && typeof candidate.description === "string" && candidate.description.trim().length > 0 && typeof candidate.history === "string" && typeof candidate.imageUrl === "string" && typeof candidate.imageAlt === "string" && typeof candidate.displayOrder === "number" && Number.isFinite(candidate.displayOrder) && isArtCultureStatus(candidate.status);
}

export function isArtGroupInput(value: unknown): value is ArtGroupInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ArtGroupInput>;
  return typeof candidate.slug === "string" && typeof candidate.name === "string" && candidate.name.trim().length > 0 && Array.isArray(candidate.artTypeIds) && typeof candidate.foundedHistory === "string" && typeof candidate.performanceManagement === "string" && typeof candidate.memberCount === "number" && Number.isFinite(candidate.memberCount) && typeof candidate.tariffMin === "number" && Number.isFinite(candidate.tariffMin) && typeof candidate.tariffMax === "number" && Number.isFinite(candidate.tariffMax) && typeof candidate.contactName === "string" && typeof candidate.contactPhone === "string" && typeof candidate.imageUrl === "string" && typeof candidate.imageAlt === "string" && typeof candidate.displayOrder === "number" && Number.isFinite(candidate.displayOrder) && isArtCultureStatus(candidate.status);
}

export function isArtCultureStatus(value: unknown): value is ArtCultureStatus {
  return value === "active" || value === "draft" || value === "archived";
}

async function loadRecords<T>(key: string, fallback: T[]) {
  const rows = await queryRows<SettingsRow>("SELECT setting_value FROM admin_site_settings WHERE setting_key = ? LIMIT 1", [key]);

  if (!rows[0]) {
    await saveRecords(key, fallback);
    return fallback;
  }

  const parsed = parseJson(rows[0].setting_value);
  return Array.isArray(parsed) ? parsed as T[] : fallback;
}

async function saveRecords<T>(key: string, records: T[]) {
  await executeSql(
    `INSERT INTO admin_site_settings (setting_key, setting_value, description, is_public)
     VALUES (?, CAST(? AS JSON), ?, TRUE)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description), is_public = TRUE`,
    [key, JSON.stringify(records), `Data ${key.replaceAll("_", " ")}`],
  );
}

function parseJson(value: string | unknown) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return null; }
}

function normalizeArtTypeIds(value: string[]) {
  return Array.from(new Set(value.map((item) => normalizeSlug(item)).filter(Boolean)));
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
