import {
  createAdminGeneralContentBlock,
  deleteAdminGeneralContentBlock,
  getAdminGeneralContentBlock,
  isAdminContentStatus,
  resetAdminGeneralContentBlocks,
  searchAdminGeneralContentBlocks,
  updateAdminGeneralContentBlock,
  type AdminGeneralContentInput,
} from "@/lib/admin-general-content-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const status = searchParams.get("status");

  if (status && !isAdminContentStatus(status)) {
    return Response.json(
      { error: "Status konten umum tidak valid." },
      { status: 400 },
    );
  }

  const parsedStatus = status && isAdminContentStatus(status) ? status : undefined;

  if (idOrSlug) {
    const block = getAdminGeneralContentBlock(idOrSlug);

    if (!block) {
      return Response.json({ error: "Konten umum tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: block });
  }

  const blocks = searchAdminGeneralContentBlocks({
    query: searchParams.get("q") ?? undefined,
    status: parsedStatus,
  });

  return Response.json({
    data: blocks,
    meta: {
      total: blocks.length,
      published: blocks.filter((block) => block.status === "published").length,
      draft: blocks.filter((block) => block.status === "draft").length,
      archived: blocks.filter((block) => block.status === "archived").length,
      query: searchParams.get("q") ?? null,
      status: status ?? null,
    },
  });
}

export async function POST(request: Request) {
  const body = await parseJsonBody<AdminGeneralContentInput>(request);

  if (!body) {
    return Response.json({ error: "Payload konten umum wajib dikirim." }, { status: 400 });
  }

  const result = createAdminGeneralContentBlock(body);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ data: result.data }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await parseJsonBody<AdminGeneralContentInput & { id?: string }>(request);

  if (!body) {
    return Response.json({ error: "Payload konten umum wajib dikirim." }, { status: 400 });
  }

  const idOrSlug = body.id ?? body.slug;

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug konten wajib dikirim." }, { status: 400 });
  }

  const result = updateAdminGeneralContentBlock(idOrSlug, body);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ data: result.data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const blocks = resetAdminGeneralContentBlocks();

    return Response.json({ data: blocks, meta: { total: blocks.length } });
  }

  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug konten wajib dikirim." }, { status: 400 });
  }

  const deleted = deleteAdminGeneralContentBlock(idOrSlug);

  if (!deleted) {
    return Response.json({ error: "Konten umum tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: deleted });
}

async function parseJsonBody<T>(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return null;
  }

  return body as T;
}
