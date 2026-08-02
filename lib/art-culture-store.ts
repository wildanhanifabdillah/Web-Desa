import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

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
  {
    id: "calung",
    slug: "calung",
    name: "Calung",
    summary: "Musik bambu tradisional yang memperkuat suasana pentas budaya desa.",
    description: "Calung menghadirkan warna musikal khas yang dapat mengiringi pentas seni maupun tampil sebagai sajian utama.",
    history: "Kelompok musik bambu dikelola warga sebagai bagian dari dokumentasi dan penguatan ekspresi budaya lokal.",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Alat musik tradisional di panggung budaya",
    displayOrder: 3,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
  {
    id: "bundengan",
    slug: "bundengan",
    name: "Bundengan",
    summary: "Kesenian khas Wonosobo yang memperkaya identitas budaya Keseneng.",
    description: "Bundengan menjadi potensi budaya yang dapat dikenalkan melalui edukasi, pertunjukan, dan dokumentasi digital desa.",
    history: "Penguatan Bundengan dilakukan melalui pengarsipan cerita, pelaku, dan kesempatan tampil dalam kegiatan budaya.",
    imageUrl: "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Musisi tradisional dalam pertunjukan budaya",
    displayOrder: 4,
    status: "active",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
];

const initialArtGroups: ArtGroupRecord[] = [
  {
    id: "bws",
    slug: "bws",
    name: "BWS",
    artTypeIds: ["jaran-kepang", "lengger"],
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
    artTypeIds: ["calung", "lengger"],
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
    artTypeIds: ["jaran-kepang", "bundengan"],
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

let artTypes: ArtTypeRecord[] | null = null;
let artGroups: ArtGroupRecord[] | null = null;

function ensureArtTypes() {
  if (!artTypes) {
    artTypes = loadJsonFile("art-culture-types.json", initialArtTypes);
  }

  return artTypes ?? [];
}

function ensureArtGroups() {
  if (!artGroups) {
    artGroups = loadJsonFile("art-culture-groups.json", initialArtGroups);
  }

  return artGroups ?? [];
}

export function listArtTypes(status?: ArtCultureStatus) {
  return ensureArtTypes()
    .filter((item) => status ? item.status === status : true)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export function listArtGroups(status?: ArtCultureStatus) {
  return ensureArtGroups()
    .filter((item) => status ? item.status === status : true)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export function getArtType(idOrSlug: string) {
  return ensureArtTypes().find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export function getArtGroup(idOrSlug: string) {
  return ensureArtGroups().find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
}

export function createArtType(input: ArtTypeInput) {
  const records = ensureArtTypes();
  const slug = normalizeSlug(input.slug || input.name);

  if (records.some((item) => item.slug === slug || item.id === slug)) {
    return null;
  }

  const record: ArtTypeRecord = {
    ...input,
    id: slug,
    slug,
    updatedAt: new Date().toISOString(),
  };

  artTypes = [...records, record];
  saveJsonFile("art-culture-types.json", artTypes);

  return record;
}

export function updateArtType(idOrSlug: string, input: Partial<ArtTypeInput>) {
  const records = ensureArtTypes();
  const existing = getArtType(idOrSlug);

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

  artTypes = records.map((item) => item.id === existing.id ? record : item);
  saveJsonFile("art-culture-types.json", artTypes);

  return record;
}

export function deleteArtType(idOrSlug: string) {
  return updateArtType(idOrSlug, { status: "archived" });
}

export function createArtGroup(input: ArtGroupInput) {
  const records = ensureArtGroups();
  const slug = normalizeSlug(input.slug || input.name);

  if (records.some((item) => item.slug === slug || item.id === slug)) {
    return null;
  }

  const record: ArtGroupRecord = {
    ...input,
    id: slug,
    slug,
    artTypeIds: normalizeArtTypeIds(input.artTypeIds),
    updatedAt: new Date().toISOString(),
  };

  artGroups = [...records, record];
  saveJsonFile("art-culture-groups.json", artGroups);

  return record;
}

export function updateArtGroup(idOrSlug: string, input: Partial<ArtGroupInput>) {
  const records = ensureArtGroups();
  const existing = getArtGroup(idOrSlug);

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

  artGroups = records.map((item) => item.id === existing.id ? record : item);
  saveJsonFile("art-culture-groups.json", artGroups);

  return record;
}

export function deleteArtGroup(idOrSlug: string) {
  return updateArtGroup(idOrSlug, { status: "archived" });
}

export function resetArtCultureRecords() {
  artTypes = resetJsonFile("art-culture-types.json", initialArtTypes);
  artGroups = resetJsonFile("art-culture-groups.json", initialArtGroups);

  return { types: artTypes, groups: artGroups };
}

export function isArtTypeInput(value: unknown): value is ArtTypeInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ArtTypeInput>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" && candidate.name.trim().length > 0 &&
    typeof candidate.summary === "string" && candidate.summary.trim().length > 0 &&
    typeof candidate.description === "string" && candidate.description.trim().length > 0 &&
    typeof candidate.history === "string" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.imageAlt === "string" &&
    typeof candidate.displayOrder === "number" && Number.isFinite(candidate.displayOrder) &&
    isArtCultureStatus(candidate.status)
  );
}

export function isArtGroupInput(value: unknown): value is ArtGroupInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ArtGroupInput>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" && candidate.name.trim().length > 0 &&
    Array.isArray(candidate.artTypeIds) &&
    typeof candidate.foundedHistory === "string" &&
    typeof candidate.performanceManagement === "string" &&
    typeof candidate.memberCount === "number" && Number.isFinite(candidate.memberCount) &&
    typeof candidate.tariffMin === "number" && Number.isFinite(candidate.tariffMin) &&
    typeof candidate.tariffMax === "number" && Number.isFinite(candidate.tariffMax) &&
    typeof candidate.contactName === "string" &&
    typeof candidate.contactPhone === "string" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.imageAlt === "string" &&
    typeof candidate.displayOrder === "number" && Number.isFinite(candidate.displayOrder) &&
    isArtCultureStatus(candidate.status)
  );
}

export function isArtCultureStatus(value: unknown): value is ArtCultureStatus {
  return value === "active" || value === "draft" || value === "archived";
}

function normalizeArtTypeIds(value: string[]) {
  return Array.from(new Set(value.map((item) => normalizeSlug(item)).filter(Boolean)));
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