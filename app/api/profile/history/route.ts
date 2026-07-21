import {
  createProfileHistoryRecord,
  deleteProfileHistoryRecord,
  getProfileHistoryRecord,
  isProfileHistoryInput,
  listProfileHistoryRecords,
  resetProfileHistoryRecords,
  updateProfileHistoryRecord,
} from "@/lib/profile-history";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const record = getProfileHistoryRecord(id);

    if (!record) {
      return Response.json({ error: "Sejarah desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({ data: listProfileHistoryRecords() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isProfileHistoryInput(body)) {
    return Response.json(
      { error: "Payload sejarah desa belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createProfileHistoryRecord(body);

  return Response.json({ data: record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID sejarah desa wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const record = updateProfileHistoryRecord(id, input);

  if (!record) {
    return Response.json({ error: "Sejarah desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: resetProfileHistoryRecords() });
  }

  if (!id) {
    return Response.json({ error: "ID sejarah desa wajib dikirim." }, { status: 400 });
  }

  const record = deleteProfileHistoryRecord(id);

  if (!record) {
    return Response.json({ error: "Sejarah desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}
