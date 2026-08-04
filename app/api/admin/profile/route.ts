import {
  isProfileGeneralInput,
  listProfileGeneralRecords,
  resetProfileGeneralRecords,
  updateProfileGeneralRecord,
  type ProfileGeneralInput,
} from "@/lib/profile-general";
import {
  isGeographyInput,
  listGeographyRecords,
  resetGeographyRecords,
  updateGeographyRecord,
  type ProfileGeographyInput,
} from "@/lib/profile-geography";
import {
  isVisionMissionInput,
  listVisionMissionRecords,
  resetVisionMissionRecords,
  updateVisionMissionRecord,
  type ProfileVisionMissionInput,
} from "@/lib/profile-vision-mission";

type ProfileSection = "general" | "geography" | "visionMission";

type ProfileUpdatePayload = {
  section?: ProfileSection;
  id?: string;
  data?: unknown;
};

export async function GET() {
  const [general, geography, visionMission] = await Promise.all([
    listProfileGeneralRecords(),
    listGeographyRecords(),
    listVisionMissionRecords(),
  ]);

  return Response.json({
    data: {
      general: general[0] ?? null,
      geography: geography[0] ?? null,
      visionMission: visionMission[0] ?? null,
    },
  });
}

export async function PUT(request: Request) {
  const body = await parseJsonBody<ProfileUpdatePayload>(request);

  if (!body?.section || !body.id || !body.data || typeof body.data !== "object") {
    return Response.json({ error: "Section, ID, dan data profil wajib dikirim." }, { status: 400 });
  }

  if (body.section === "general") {
    if (!isProfileGeneralInput(body.data)) {
      return Response.json({ error: "Payload gambaran umum belum lengkap atau tidak valid." }, { status: 400 });
    }

    const updated = await updateProfileGeneralRecord(body.id, body.data as ProfileGeneralInput);

    if (!updated) {
      return Response.json({ error: "Gambaran umum profil tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: updated });
  }

  if (body.section === "geography") {
    if (!isGeographyInput(body.data)) {
      return Response.json({ error: "Payload geografis belum lengkap atau tidak valid." }, { status: 400 });
    }

    const updated = await updateGeographyRecord(body.id, body.data as ProfileGeographyInput);

    if (!updated) {
      return Response.json({ error: "Data geografis tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: updated });
  }

  if (body.section === "visionMission") {
    if (!isVisionMissionInput(body.data)) {
      return Response.json({ error: "Payload visi dan misi belum lengkap atau tidak valid." }, { status: 400 });
    }

    const updated = await updateVisionMissionRecord(body.id, body.data as ProfileVisionMissionInput);

    if (!updated) {
      return Response.json({ error: "Visi dan misi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: updated });
  }

  return Response.json({ error: "Section profil tidak dikenal." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const resetTarget = searchParams.get("reset");

  if (resetTarget === "general") {
    const records = await resetProfileGeneralRecords();
    return Response.json({ data: records[0] ?? null });
  }

  if (resetTarget === "geography") {
    const records = await resetGeographyRecords();
    return Response.json({ data: records[0] ?? null });
  }

  if (resetTarget === "visionMission") {
    const records = await resetVisionMissionRecords();
    return Response.json({ data: records[0] ?? null });
  }

  if (resetTarget === "all") {
    const [general, geography, visionMission] = await Promise.all([
      resetProfileGeneralRecords(),
      resetGeographyRecords(),
      resetVisionMissionRecords(),
    ]);

    return Response.json({
      data: {
        general: general[0] ?? null,
        geography: geography[0] ?? null,
        visionMission: visionMission[0] ?? null,
      },
    });
  }

  return Response.json({ error: "Parameter reset harus general, geography, visionMission, atau all." }, { status: 400 });
}

async function parseJsonBody<T>(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return null;
  }

  return body as T;
}