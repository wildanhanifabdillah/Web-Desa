import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type ProfileOfficialRecord = {
  id: string;
  name: string;
  role: string;
  focus: string;
  contact: string;
  area: string;
  photoUrl?: string;
  photoAlt?: string;
  displayOrder: number;
  updatedAt: string;
};

export type ProfileOfficialInput = Omit<ProfileOfficialRecord, "id" | "updatedAt">;

type OfficialRow = RowDataPacket & {
  id: string;
  name: string;
  role: string;
  focus: string;
  contact: string;
  area: string;
  photo_url: string | null;
  photo_alt: string | null;
  display_order: number;
  updated_at: Date | string;
};

type ProfileIdRow = RowDataPacket & { id: string };

export async function listOfficialRecords() {
  const rows = await queryRows<OfficialRow>(
    `SELECT id, name, role, focus, contact, area, photo_url, photo_alt, display_order, updated_at
     FROM village_profile_officials
     WHERE profile_id = (SELECT id FROM village_profiles WHERE is_active = TRUE ORDER BY updated_at DESC LIMIT 1)
     ORDER BY display_order ASC, name ASC`,
  );

  return rows.map(mapOfficialRow);
}

export async function getOfficialRecord(id: string) {
  const rows = await queryRows<OfficialRow>(
    `SELECT id, name, role, focus, contact, area, photo_url, photo_alt, display_order, updated_at
     FROM village_profile_officials
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapOfficialRow(rows[0]) : null;
}

export async function createOfficialRecord(input: ProfileOfficialInput) {
  const profileId = await getActiveProfileId();
  const recordId = crypto.randomUUID();

  await executeSql(
    `INSERT INTO village_profile_officials
     (id, profile_id, name, role, focus, contact, area, photo_url, photo_alt, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recordId,
      profileId,
      input.name,
      input.role,
      input.focus,
      input.contact ?? "",
      input.area ?? "",
      input.photoUrl ?? null,
      input.photoAlt ?? null,
      input.displayOrder,
    ],
  );

  return getOfficialRecord(recordId);
}

export async function updateOfficialRecord(id: string, input: Partial<ProfileOfficialInput>) {
  const existingRecord = await getOfficialRecord(id);

  if (!existingRecord) {
    return null;
  }

  const updated = { ...existingRecord, ...input };

  await executeSql(
    `UPDATE village_profile_officials
     SET name = ?, role = ?, focus = ?, contact = ?, area = ?, photo_url = ?, photo_alt = ?, display_order = ?
     WHERE id = ?`,
    [
      updated.name,
      updated.role,
      updated.focus,
      updated.contact ?? "",
      updated.area ?? "",
      updated.photoUrl ?? null,
      updated.photoAlt ?? null,
      updated.displayOrder,
      id,
    ],
  );

  return getOfficialRecord(id);
}

export async function deleteOfficialRecord(id: string) {
  const existingRecord = await getOfficialRecord(id);

  if (!existingRecord) {
    return null;
  }

  await executeSql("DELETE FROM village_profile_officials WHERE id = ?", [id]);

  return existingRecord;
}

export async function resetOfficialRecords() {
  return listOfficialRecords();
}

export function isOfficialInput(value: unknown): value is ProfileOfficialInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProfileOfficialInput, unknown>>;

  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.role === "string" &&
    candidate.role.trim().length > 0 &&
    typeof candidate.focus === "string" &&
    candidate.focus.trim().length > 0 &&
    (candidate.contact === undefined || typeof candidate.contact === "string") &&
    (candidate.area === undefined || typeof candidate.area === "string") &&
    (candidate.photoUrl === undefined || typeof candidate.photoUrl === "string") &&
    (candidate.photoAlt === undefined || typeof candidate.photoAlt === "string") &&
    typeof candidate.displayOrder === "number" &&
    Number.isFinite(candidate.displayOrder)
  );
}

async function getActiveProfileId() {
  const rows = await queryRows<ProfileIdRow>(
    "SELECT id FROM village_profiles WHERE is_active = TRUE ORDER BY updated_at DESC LIMIT 1",
  );

  if (!rows[0]) {
    throw new Error("Profil desa aktif belum tersedia. Jalankan migration dan seeder database.");
  }

  return rows[0].id;
}

function mapOfficialRow(row: OfficialRow): ProfileOfficialRecord {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    focus: row.focus,
    contact: row.contact,
    area: row.area,
    photoUrl: row.photo_url ?? undefined,
    photoAlt: row.photo_alt ?? undefined,
    displayOrder: Number(row.display_order),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
  };
}
