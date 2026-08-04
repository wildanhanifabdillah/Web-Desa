import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";
import type { ProfileHighlight } from "@/lib/profile";

export type ProfileGeneralRecord = {
  id: string;
  slug: string;
  villageName: string;
  district: string;
  regency: string;
  province: string;
  character: string;
  description: string;
  area: string;
  elevation: string;
  dominantLandUse: string;
  overviewKicker: string;
  overviewTitle: string;
  overviewDescription: string;
  overviewBody: string;
  highlights: ProfileHighlight[];
  pillars: string[];
  updatedAt: string;
};

export type ProfileGeneralInput = Omit<ProfileGeneralRecord, "id" | "updatedAt">;

type ProfileRow = RowDataPacket & {
  id: string;
  slug: string;
  village_name: string;
  hero_description: string;
  overview_kicker: string;
  overview_title: string;
  overview_description: string;
  overview_body: string;
  updated_at: Date | string;
};

type FactRow = RowDataPacket & {
  label: string;
  value: string;
};

type PillarRow = RowDataPacket & {
  name: string;
};

export async function listProfileGeneralRecords() {
  const rows = await queryRows<ProfileRow>(
    `SELECT id, slug, village_name, hero_description, overview_kicker, overview_title,
            overview_description, overview_body, updated_at
     FROM village_profiles
     WHERE is_active = TRUE
     ORDER BY updated_at DESC`,
  );

  return Promise.all(rows.map(mapProfileGeneralRow));
}

export async function getProfileGeneralRecord(id: string) {
  const rows = await queryRows<ProfileRow>(
    `SELECT id, slug, village_name, hero_description, overview_kicker, overview_title,
            overview_description, overview_body, updated_at
     FROM village_profiles
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [id, id],
  );

  return rows[0] ? mapProfileGeneralRow(rows[0]) : null;
}

export async function createProfileGeneralRecord(input: ProfileGeneralInput) {
  const id = crypto.randomUUID();

  await executeSql(
    `INSERT INTO village_profiles
     (id, slug, village_name, hero_eyebrow, hero_title, hero_description,
      overview_kicker, overview_title, overview_description, overview_body,
      history_kicker, history_title, history_description,
      geography_kicker, geography_title, geography_description,
      vision_label, vision_title, vision_description, is_active)
     VALUES (?, ?, ?, 'Profil Desa', ?, ?, ?, ?, ?, ?,
      'Sejarah Desa', 'Linimasa perkembangan desa.', 'Data sejarah desa.',
      'Kondisi Geografis', 'Kondisi geografis desa.', 'Data geografis desa.',
      'Visi Desa', 'Visi desa.', 'Misi desa.', TRUE)`,
    [
      id,
      input.slug,
      input.villageName,
      `Mengenal ${input.villageName}, desa ${input.character.toLowerCase()}.`,
      input.description,
      input.overviewKicker,
      input.overviewTitle,
      input.overviewDescription,
      input.overviewBody,
    ],
  );
  await replaceGeneralFacts(id, input);
  await replaceHighlights(id, input.highlights);
  await replacePillars(id, input.pillars);

  return getProfileGeneralRecord(id);
}

export async function updateProfileGeneralRecord(id: string, input: Partial<ProfileGeneralInput>) {
  const existingRecord = await getProfileGeneralRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updated = { ...existingRecord, ...input };

  await executeSql(
    `UPDATE village_profiles
     SET slug = ?, village_name = ?, hero_title = ?, hero_description = ?,
         overview_kicker = ?, overview_title = ?, overview_description = ?, overview_body = ?
     WHERE id = ?`,
    [
      updated.slug,
      updated.villageName,
      `Mengenal ${updated.villageName}, desa ${updated.character.toLowerCase()}.`,
      updated.description,
      updated.overviewKicker,
      updated.overviewTitle,
      updated.overviewDescription,
      updated.overviewBody,
      existingRecord.id,
    ],
  );
  await replaceGeneralFacts(existingRecord.id, updated);
  await replaceHighlights(existingRecord.id, updated.highlights);
  await replacePillars(existingRecord.id, updated.pillars);

  return getProfileGeneralRecord(existingRecord.id);
}

export async function deleteProfileGeneralRecord(id: string) {
  const existingRecord = await getProfileGeneralRecord(id);

  if (!existingRecord) {
    return null;
  }

  await executeSql("DELETE FROM village_profiles WHERE id = ?", [existingRecord.id]);

  return existingRecord;
}

export async function resetProfileGeneralRecords() {
  await executeSql("UPDATE village_profiles SET is_active = TRUE WHERE slug = 'desa-keseneng'");

  return listProfileGeneralRecords();
}

export function isProfileGeneralInput(value: unknown): value is ProfileGeneralInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileGeneralInput, unknown>>;
  const requiredStringFields: Array<keyof ProfileGeneralInput> = [
    "slug",
    "villageName",
    "district",
    "regency",
    "province",
    "character",
    "description",
    "area",
    "elevation",
    "dominantLandUse",
    "overviewKicker",
    "overviewTitle",
    "overviewDescription",
    "overviewBody",
  ];

  return (
    requiredStringFields.every((field) => typeof candidate[field] === "string" && candidate[field].trim().length > 0) &&
    Array.isArray(candidate.highlights) &&
    candidate.highlights.every(isHighlightInput) &&
    Array.isArray(candidate.pillars) &&
    candidate.pillars.every((pillar) => typeof pillar === "string" && pillar.trim().length > 0)
  );
}

async function mapProfileGeneralRow(row: ProfileRow): Promise<ProfileGeneralRecord> {
  const [facts, highlights, pillars] = await Promise.all([
    queryRows<FactRow>(
      `SELECT label, value
       FROM village_profile_facts
       WHERE profile_id = ? AND section = 'hero'
       ORDER BY display_order ASC`,
      [row.id],
    ),
    queryRows<FactRow>(
      `SELECT label, value
       FROM village_profile_highlights
       WHERE profile_id = ?
       ORDER BY display_order ASC`,
      [row.id],
    ),
    queryRows<PillarRow>(
      `SELECT name
       FROM village_profile_pillars
       WHERE profile_id = ?
       ORDER BY display_order ASC`,
      [row.id],
    ),
  ]);
  const byLabel = new Map(facts.map((fact) => [fact.label.toLowerCase(), fact.value]));

  return {
    id: row.id,
    slug: row.slug,
    villageName: row.village_name,
    district: byLabel.get("kecamatan") ?? "Mojotengah",
    regency: byLabel.get("kabupaten") ?? "Wonosobo",
    province: byLabel.get("provinsi") ?? "Jawa Tengah",
    character: byLabel.get("karakter") ?? "Agraris dan budaya",
    description: row.hero_description,
    area: byLabel.get("luas wilayah") ?? "328 ha",
    elevation: byLabel.get("ketinggian") ?? "820 mdpl",
    dominantLandUse: byLabel.get("dominasi lahan") ?? "Sawah dan kebun",
    overviewKicker: row.overview_kicker,
    overviewTitle: row.overview_title,
    overviewDescription: row.overview_description,
    overviewBody: row.overview_body,
    highlights: highlights.map((highlight) => ({ label: highlight.label, value: highlight.value })),
    pillars: pillars.map((pillar) => pillar.name),
    updatedAt: normalizeSqlDate(row.updated_at),
  };
}

async function replaceGeneralFacts(profileId: string, record: ProfileGeneralRecord | ProfileGeneralInput) {
  await executeSql("DELETE FROM village_profile_facts WHERE profile_id = ? AND section = 'hero'", [profileId]);
  const facts = [
    ["Kecamatan", record.district],
    ["Kabupaten", record.regency],
    ["Provinsi", record.province],
    ["Karakter", record.character],
    ["Luas wilayah", record.area],
    ["Ketinggian", record.elevation],
    ["Dominasi lahan", record.dominantLandUse],
  ];

  for (const [index, fact] of facts.entries()) {
    await executeSql(
      "INSERT INTO village_profile_facts (id, profile_id, section, label, value, display_order) VALUES (?, ?, 'hero', ?, ?, ?)",
      [crypto.randomUUID(), profileId, fact[0], fact[1], index + 1],
    );
  }
}

async function replaceHighlights(profileId: string, highlights: ProfileHighlight[]) {
  await executeSql("DELETE FROM village_profile_highlights WHERE profile_id = ?", [profileId]);

  for (const [index, highlight] of highlights.entries()) {
    await executeSql(
      "INSERT INTO village_profile_highlights (id, profile_id, label, value, display_order) VALUES (?, ?, ?, ?, ?)",
      [crypto.randomUUID(), profileId, highlight.label, highlight.value, index + 1],
    );
  }
}

async function replacePillars(profileId: string, pillars: string[]) {
  await executeSql("DELETE FROM village_profile_pillars WHERE profile_id = ?", [profileId]);

  for (const [index, pillar] of pillars.entries()) {
    await executeSql(
      "INSERT INTO village_profile_pillars (id, profile_id, name, display_order) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), profileId, pillar, index + 1],
    );
  }
}

function isHighlightInput(value: unknown): value is ProfileHighlight {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProfileHighlight>;

  return typeof candidate.label === "string" && candidate.label.trim().length > 0 &&
    typeof candidate.value === "string" && candidate.value.trim().length > 0;
}

function normalizeSqlDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}