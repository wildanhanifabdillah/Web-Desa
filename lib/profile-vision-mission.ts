import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type ProfileMissionInput = {
  focus: string;
  description: string;
};

export type ProfileVisionMissionRecord = {
  id: string;
  visionLabel: string;
  visionTitle: string;
  visionDescription: string;
  missions: ProfileMissionInput[];
  updatedAt: string;
};

export type ProfileVisionMissionInput = Omit<ProfileVisionMissionRecord, "id" | "updatedAt">;

type VisionMissionRow = RowDataPacket & {
  id: string;
  vision_label: string;
  vision_title: string;
  vision_description: string;
  updated_at: Date | string;
};

type MissionRow = RowDataPacket & {
  focus: string;
  description: string;
};

const defaultVisionMission: ProfileVisionMissionInput = {
  visionLabel: "Visi Desa",
  visionTitle: "Terwujudnya Desa Keseneng yang maju, terbuka, mandiri, dan berdaya melalui potensi lokal.",
  visionDescription: "Visi dan misi ini menampilkan arah pembangunan desa yang dikelola melalui panel admin.",
  missions: [
    { focus: "Pelayanan Publik", description: "Meningkatkan kualitas pelayanan desa yang cepat, terbuka, dan mudah diakses warga." },
    { focus: "Potensi Lokal", description: "Menguatkan pertanian, kesenian, dan UMKM sebagai identitas ekonomi Desa Keseneng." },
    { focus: "Partisipasi Warga", description: "Mendorong gotong royong, musyawarah, dan keterlibatan warga dalam pembangunan desa." },
    { focus: "Digitalisasi Desa", description: "Mengembangkan pemanfaatan teknologi untuk pengelolaan data dan publikasi kegiatan desa." },
  ],
};

export async function listVisionMissionRecords() {
  const rows = await queryRows<VisionMissionRow>(
    `SELECT id, vision_label, vision_title, vision_description, updated_at
     FROM village_profiles
     WHERE is_active = TRUE
     ORDER BY updated_at DESC`,
  );

  return Promise.all(rows.map(mapVisionMissionRow));
}

export async function getVisionMissionRecord(id: string) {
  const rows = await queryRows<VisionMissionRow>(
    `SELECT id, vision_label, vision_title, vision_description, updated_at
     FROM village_profiles
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [id, id],
  );

  return rows[0] ? mapVisionMissionRow(rows[0]) : null;
}

export async function createVisionMissionRecord(input: ProfileVisionMissionInput) {
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
      'Kondisi Geografis', 'Kondisi geografis desa.', 'Data geografis desa.',
      ?, ?, ?, TRUE)`,
    [id, `profil-${id}`, input.visionLabel, input.visionTitle, input.visionDescription],
  );
  await replaceMissions(id, input.missions);

  return getVisionMissionRecord(id);
}

export async function updateVisionMissionRecord(id: string, input: Partial<ProfileVisionMissionInput>) {
  const existingRecord = await getVisionMissionRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updated: ProfileVisionMissionRecord = {
    ...existingRecord,
    ...input,
    missions: input.missions ?? existingRecord.missions,
  };

  await executeSql(
    `UPDATE village_profiles
     SET vision_label = ?, vision_title = ?, vision_description = ?
     WHERE id = ?`,
    [updated.visionLabel, updated.visionTitle, updated.visionDescription, existingRecord.id],
  );
  await replaceMissions(existingRecord.id, updated.missions);

  return getVisionMissionRecord(existingRecord.id);
}

export async function deleteVisionMissionRecord(id: string) {
  const existingRecord = await getVisionMissionRecord(id);

  if (!existingRecord) {
    return null;
  }

  await executeSql("DELETE FROM village_profile_missions WHERE profile_id = ?", [existingRecord.id]);
  await executeSql(
    "UPDATE village_profiles SET vision_label = ?, vision_title = ?, vision_description = ? WHERE id = ?",
    [defaultVisionMission.visionLabel, defaultVisionMission.visionTitle, defaultVisionMission.visionDescription, existingRecord.id],
  );

  return existingRecord;
}

export async function resetVisionMissionRecords() {
  const rows = await listVisionMissionRecords();
  const record = rows[0];

  if (!record) {
    const created = await createVisionMissionRecord(defaultVisionMission);
    return created ? [created] : [];
  }

  const updated = await updateVisionMissionRecord(record.id, defaultVisionMission);

  return updated ? [updated] : [];
}

export function isVisionMissionInput(value: unknown): value is ProfileVisionMissionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileVisionMissionInput, unknown>>;

  return (
    typeof candidate.visionLabel === "string" &&
    candidate.visionLabel.trim().length > 0 &&
    typeof candidate.visionTitle === "string" &&
    candidate.visionTitle.trim().length > 0 &&
    typeof candidate.visionDescription === "string" &&
    candidate.visionDescription.trim().length > 0 &&
    Array.isArray(candidate.missions) &&
    candidate.missions.every(isMissionInput)
  );
}

async function mapVisionMissionRow(row: VisionMissionRow): Promise<ProfileVisionMissionRecord> {
  const missions = await queryRows<MissionRow>(
    `SELECT focus, description
     FROM village_profile_missions
     WHERE profile_id = ?
     ORDER BY display_order ASC`,
    [row.id],
  );

  return {
    id: row.id,
    visionLabel: row.vision_label,
    visionTitle: row.vision_title,
    visionDescription: row.vision_description,
    missions: missions.map((mission) => ({ focus: mission.focus, description: mission.description })),
    updatedAt: normalizeSqlDate(row.updated_at),
  };
}

async function replaceMissions(profileId: string, missions: ProfileMissionInput[]) {
  await executeSql("DELETE FROM village_profile_missions WHERE profile_id = ?", [profileId]);

  for (const [index, mission] of missions.entries()) {
    await executeSql(
      "INSERT INTO village_profile_missions (id, profile_id, focus, description, display_order) VALUES (?, ?, ?, ?, ?)",
      [crypto.randomUUID(), profileId, mission.focus, mission.description, index + 1],
    );
  }
}

function isMissionInput(value: unknown): value is ProfileMissionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProfileMissionInput>;

  return (
    typeof candidate.focus === "string" &&
    candidate.focus.trim().length > 0 &&
    typeof candidate.description === "string" &&
    candidate.description.trim().length > 0
  );
}

function normalizeSqlDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
