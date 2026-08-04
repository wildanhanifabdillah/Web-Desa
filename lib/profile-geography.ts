import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type ProfileGeographyFact = {
  label: string;
  value: string;
};

export type ProfileGeographyRecord = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  stats: ProfileGeographyFact[];
  borders: ProfileGeographyFact[];
  updatedAt: string;
};

export type ProfileGeographyInput = Omit<ProfileGeographyRecord, "id" | "updatedAt">;

type ProfileGeographyRow = RowDataPacket & {
  id: string;
  geography_kicker: string;
  geography_title: string;
  geography_description: string;
  updated_at: Date | string;
};

type FactRow = RowDataPacket & {
  section: "geography_stat" | "geography_border";
  label: string;
  value: string;
};

const defaultGeography: ProfileGeographyInput = {
  kicker: "Kondisi Geografis",
  title: "Lanskap desa yang mendukung pangan dan wisata lokal.",
  description:
    "Wilayah desa didominasi area permukiman, sawah, kebun, dan ruang kegiatan warga sebagai modal pengembangan pertanian produktif serta potensi kunjungan berbasis budaya desa.",
  stats: [
    { label: "Luas wilayah", value: "328 ha" },
    { label: "Jumlah dusun", value: "6 dusun" },
    { label: "Ketinggian", value: "820 mdpl" },
    { label: "Dominasi lahan", value: "Sawah dan kebun" },
  ],
  borders: [
    { label: "Utara", value: "Desa tetangga kawasan perbukitan" },
    { label: "Timur", value: "Area kebun dan jalur penghubung dusun" },
    { label: "Selatan", value: "Lahan pertanian warga" },
    { label: "Barat", value: "Permukiman dan akses kecamatan" },
  ],
};

export async function listGeographyRecords() {
  const rows = await queryRows<ProfileGeographyRow>(
    `SELECT id, geography_kicker, geography_title, geography_description, updated_at
     FROM village_profiles
     WHERE is_active = TRUE
     ORDER BY updated_at DESC`,
  );

  return Promise.all(rows.map(mapGeographyRow));
}

export async function getGeographyRecord(id: string) {
  const rows = await queryRows<ProfileGeographyRow>(
    `SELECT id, geography_kicker, geography_title, geography_description, updated_at
     FROM village_profiles
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [id, id],
  );

  return rows[0] ? mapGeographyRow(rows[0]) : null;
}

export async function createGeographyRecord(input: ProfileGeographyInput) {
  const id = crypto.randomUUID();

  await executeSql(
    `INSERT INTO village_profiles
     (id, slug, village_name, hero_eyebrow, hero_title, hero_description,
      overview_kicker, overview_title, overview_description, overview_body,
      history_kicker, history_title, history_description,
      geography_kicker, geography_title, geography_description,
      vision_label, vision_title, vision_description, is_active)
     VALUES (?, ?, 'Desa Keseneng', 'Profil Desa', 'Profil Desa Keseneng', 'Profil Desa Keseneng.',
      'Gambaran Umum', 'Gambaran umum desa.', 'Gambaran umum desa.', 'Gambaran umum desa.',
      'Sejarah Desa', 'Sejarah desa.', 'Sejarah desa.',
      ?, ?, ?, 'Visi Desa', 'Visi desa.', 'Misi desa.', TRUE)`,
    [id, `profil-${id}`, input.kicker, input.title, input.description],
  );
  await replaceGeographyFacts(id, input);

  return getGeographyRecord(id);
}

export async function updateGeographyRecord(id: string, input: Partial<ProfileGeographyInput>) {
  const existingRecord = await getGeographyRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updated: ProfileGeographyRecord = {
    ...existingRecord,
    ...input,
    stats: input.stats ?? existingRecord.stats,
    borders: input.borders ?? existingRecord.borders,
  };

  await executeSql(
    `UPDATE village_profiles
     SET geography_kicker = ?, geography_title = ?, geography_description = ?
     WHERE id = ?`,
    [updated.kicker, updated.title, updated.description, existingRecord.id],
  );
  await replaceGeographyFacts(existingRecord.id, updated);

  return getGeographyRecord(existingRecord.id);
}

export async function deleteGeographyRecord(id: string) {
  const existingRecord = await getGeographyRecord(id);

  if (!existingRecord) {
    return null;
  }

  await executeSql(
    "DELETE FROM village_profile_facts WHERE profile_id = ? AND section IN ('geography_stat', 'geography_border')",
    [existingRecord.id],
  );
  await executeSql(
    "UPDATE village_profiles SET geography_kicker = ?, geography_title = ?, geography_description = ? WHERE id = ?",
    [defaultGeography.kicker, defaultGeography.title, defaultGeography.description, existingRecord.id],
  );

  return existingRecord;
}

export async function resetGeographyRecords() {
  const rows = await listGeographyRecords();
  const record = rows[0];

  if (!record) {
    const created = await createGeographyRecord(defaultGeography);
    return created ? [created] : [];
  }

  const updated = await updateGeographyRecord(record.id, defaultGeography);

  return updated ? [updated] : [];
}

export function isGeographyInput(value: unknown): value is ProfileGeographyInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileGeographyInput, unknown>>;

  return (
    isOptionalOrFilledString(candidate.kicker) &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0 &&
    Array.isArray(candidate.stats) &&
    candidate.stats.every(isGeographyFact) &&
    Array.isArray(candidate.borders) &&
    candidate.borders.every(isGeographyFact)
  );
}

async function mapGeographyRow(row: ProfileGeographyRow): Promise<ProfileGeographyRecord> {
  const facts = await queryRows<FactRow>(
    `SELECT section, label, value
     FROM village_profile_facts
     WHERE profile_id = ? AND section IN ('geography_stat', 'geography_border')
     ORDER BY section ASC, display_order ASC`,
    [row.id],
  );

  return {
    id: row.id,
    kicker: row.geography_kicker,
    title: row.geography_title,
    description: row.geography_description,
    stats: facts.filter((fact) => fact.section === "geography_stat").map(mapFact),
    borders: facts.filter((fact) => fact.section === "geography_border").map(mapFact),
    updatedAt: normalizeSqlDate(row.updated_at),
  };
}

async function replaceGeographyFacts(profileId: string, record: ProfileGeographyInput) {
  await executeSql(
    "DELETE FROM village_profile_facts WHERE profile_id = ? AND section IN ('geography_stat', 'geography_border')",
    [profileId],
  );

  for (const [index, fact] of record.stats.entries()) {
    await executeSql(
      "INSERT INTO village_profile_facts (id, profile_id, section, label, value, display_order) VALUES (?, ?, 'geography_stat', ?, ?, ?)",
      [crypto.randomUUID(), profileId, fact.label, fact.value, index + 1],
    );
  }

  for (const [index, fact] of record.borders.entries()) {
    await executeSql(
      "INSERT INTO village_profile_facts (id, profile_id, section, label, value, display_order) VALUES (?, ?, 'geography_border', ?, ?, ?)",
      [crypto.randomUUID(), profileId, fact.label, fact.value, index + 1],
    );
  }
}

function mapFact(row: FactRow): ProfileGeographyFact {
  return { label: row.label, value: row.value };
}

function isGeographyFact(value: unknown): value is ProfileGeographyFact {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProfileGeographyFact>;

  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.value === "string" &&
    candidate.value.trim().length > 0
  );
}

function isOptionalOrFilledString(value: unknown) {
  return value === undefined || (typeof value === "string" && value.trim().length > 0);
}

function normalizeSqlDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
