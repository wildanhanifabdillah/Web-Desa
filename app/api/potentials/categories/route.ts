import {
  createCategoryRecord,
  deleteCategoryRecord,
  getCategoryRecord,
  isPotentialCategoryInput,
  listCategoryRecords,
  resetCategoryRecords,
  updateCategoryRecord,
} from "@/lib/potential-category-store";

export async function GET(request: Request) {
  const categories = await listCategoryRecords();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();
  const slug = searchParams.get("slug")?.trim().toLowerCase();

  if (slug) {
    const category = await getCategoryRecord(slug);

    if (!category) {
      return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: serializeCategory(category) });
  }

  const filteredCategories = query
    ? categories.filter((category) =>
        [
          category.label,
          category.title,
          category.summary,
          category.detail.eyebrow,
          category.detail.intro,
          category.detail.description,
          ...category.highlights,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : categories;

  return Response.json({
    data: filteredCategories.map(serializeCategory),
    meta: {
      total: filteredCategories.length,
      query: query ?? null,
    },
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isPotentialCategoryInput(body)) {
    return Response.json(
      { error: "Payload kategori potensi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const category = await createCategoryRecord(body);

  if (!category) {
    return Response.json({ error: "Slug kategori potensi sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: serializeCategory(category) }, { status: 201 });
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { slug?: unknown }).slug !== "string") {
    return Response.json({ error: "Slug kategori potensi wajib dikirim." }, { status: 400 });
  }

  const { slug, ...input } = body as { slug: string } & Record<string, unknown>;
  const category = await updateCategoryRecord(slug, input);

  if (!category) {
    return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: serializeCategory(category) });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim().toLowerCase();
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    const categories = await resetCategoryRecords();

    return Response.json({ data: categories.map(serializeCategory) });
  }

  if (!slug) {
    return Response.json({ error: "Slug kategori potensi wajib dikirim." }, { status: 400 });
  }

  const category = await deleteCategoryRecord(slug);

  if (!category) {
    return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: serializeCategory(category) });
}

function serializeCategory(category: Awaited<ReturnType<typeof listCategoryRecords>>[number]) {
  return {
    slug: category.slug,
    label: category.label,
    title: category.title,
    summary: category.summary,
    image: category.image,
    detail: category.detail,
    gallery: category.gallery,
    stats: category.stats,
    highlights: category.highlights,
    accentClassName: category.accentClassName,
  };
}
