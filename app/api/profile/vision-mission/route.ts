import {
  createVisionMissionRecord,
  deleteVisionMissionRecord,
  getVisionMissionRecord,
  isVisionMissionInput,
  listVisionMissionRecords,
  resetVisionMissionRecords,
  updateVisionMissionRecord,
} from "@/lib/profile-vision-mission";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const record = getVisionMissionRecord(id);

    if (!record) {
      return Response.json({ error: "Visi dan misi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({ data: listVisionMissionRecords() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isVisionMissionInput(body)) {
    return Response.json(
      { error: "Payload visi dan misi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createVisionMissionRecord(body);

  return Response.json({ data: record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID visi dan misi wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const record = updateVisionMissionRecord(id, input);

  if (!record) {
    return Response.json({ error: "Visi dan misi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: resetVisionMissionRecords() });
  }

  if (!id) {
    return Response.json({ error: "ID visi dan misi wajib dikirim." }, { status: 400 });
  }

  const record = deleteVisionMissionRecord(id);

  if (!record) {
    return Response.json({ error: "Visi dan misi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}
