import {
  createOfficialRecord,
  deleteOfficialRecord,
  getOfficialRecord,
  isOfficialInput,
  listOfficialRecords,
  resetOfficialRecords,
  updateOfficialRecord,
} from "@/lib/profile-officials";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const record = getOfficialRecord(id);

    if (!record) {
      return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({ data: listOfficialRecords() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isOfficialInput(body)) {
    return Response.json(
      { error: "Payload perangkat desa belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createOfficialRecord(body);

  return Response.json({ data: record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID perangkat desa wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const record = updateOfficialRecord(id, input);

  if (!record) {
    return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: resetOfficialRecords() });
  }

  if (!id) {
    return Response.json({ error: "ID perangkat desa wajib dikirim." }, { status: 400 });
  }

  const record = deleteOfficialRecord(id);

  if (!record) {
    return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}
