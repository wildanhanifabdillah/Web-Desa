import {
  createProfileGeneralRecord,
  deleteProfileGeneralRecord,
  getProfileGeneralRecord,
  isProfileGeneralInput,
  listProfileGeneralRecords,
  resetProfileGeneralRecords,
  updateProfileGeneralRecord,
} from "@/lib/profile-general";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const record = getProfileGeneralRecord(id);

    if (!record) {
      return Response.json({ error: "Profil umum desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({ data: listProfileGeneralRecords() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isProfileGeneralInput(body)) {
    return Response.json(
      { error: "Payload profil umum desa belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createProfileGeneralRecord(body);

  return Response.json({ data: record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID profil umum desa wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const record = updateProfileGeneralRecord(id, input);

  if (!record) {
    return Response.json({ error: "Profil umum desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: resetProfileGeneralRecords() });
  }

  if (!id) {
    return Response.json({ error: "ID profil umum desa wajib dikirim." }, { status: 400 });
  }

  const record = deleteProfileGeneralRecord(id);

  if (!record) {
    return Response.json({ error: "Profil umum desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}
