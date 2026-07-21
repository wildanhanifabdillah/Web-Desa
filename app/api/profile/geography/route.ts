import {
  createGeographyRecord,
  deleteGeographyRecord,
  getGeographyRecord,
  isGeographyInput,
  listGeographyRecords,
  resetGeographyRecords,
  updateGeographyRecord,
} from "@/lib/profile-geography";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const record = getGeographyRecord(id);

    if (!record) {
      return Response.json({ error: "Data geografis tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({ data: listGeographyRecords() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isGeographyInput(body)) {
    return Response.json(
      { error: "Payload data geografis belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createGeographyRecord(body);

  return Response.json({ data: record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID data geografis wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const record = updateGeographyRecord(id, input);

  if (!record) {
    return Response.json({ error: "Data geografis tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: resetGeographyRecords() });
  }

  if (!id) {
    return Response.json({ error: "ID data geografis wajib dikirim." }, { status: 400 });
  }

  const record = deleteGeographyRecord(id);

  if (!record) {
    return Response.json({ error: "Data geografis tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}
