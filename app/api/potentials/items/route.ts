import {
  createPotentialItem,
  deletePotentialItem,
  getPotentialItem,
  isPotentialItemInput,
  listPotentialItems,
  resetPotentialItems,
  updatePotentialItem,
} from "@/lib/potential-item-store";

export async function GET(request: Request) {
  const items = await listPotentialItems();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const category = searchParams.get("category")?.trim().toLowerCase();
  const status = searchParams.get("status")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (id) {
    const item = await getPotentialItem(id);

    if (!item) {
      return Response.json({ error: "Potensi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: item });
  }

  const filteredItems = items.filter((item) => {
    const matchCategory = category ? item.categorySlug === category : true;
    const matchStatus = status ? item.status === status : true;
    const matchQuery = query
      ? [item.title, item.summary, item.description, item.categorySlug]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchCategory && matchStatus && matchQuery;
  });

  return Response.json({
    data: filteredItems,
    meta: {
      total: filteredItems.length,
      category: category ?? null,
      status: status ?? null,
      query: query ?? null,
    },
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isPotentialItemInput(body)) {
    return Response.json(
      { error: "Payload potensi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const item = await createPotentialItem(body);

  if (!item) {
    return Response.json({ error: "Slug potensi sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: item }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return Response.json({ error: "ID atau slug potensi wajib dikirim." }, { status: 400 });
  }

  const { id, ...input } = body as { id: string } & Record<string, unknown>;
  const item = await updatePotentialItem(id, input);

  if (!item) {
    return Response.json({ error: "Potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: item });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    return Response.json({ data: await resetPotentialItems() });
  }

  if (!id) {
    return Response.json({ error: "ID atau slug potensi wajib dikirim." }, { status: 400 });
  }

  const item = await deletePotentialItem(id);

  if (!item) {
    return Response.json({ error: "Potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: item });
}
