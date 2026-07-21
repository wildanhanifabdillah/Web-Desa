import {
  createAdminStatisticRecord,
  deleteAdminStatisticRecord,
  isAdminStatisticCreateInput,
  isAdminStatisticUpdateInput,
  isStatisticStatus,
  listAdminStatistics,
  resetAdminStatisticRecords,
  updateAdminStatisticRecord,
  type AdminStatisticCreateType,
} from "@/lib/admin-statistics-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (status && !isStatisticStatus(status)) {
    return Response.json(
      {
        error: "Status statistik tidak valid.",
        allowedStatus: ["draft", "published", "archived"],
      },
      { status: 400 },
    );
  }

  const parsedStatus = status && isStatisticStatus(status) ? status : undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  if (limitParam && (!Number.isInteger(limit) || Number(limit) <= 0)) {
    return Response.json(
      { error: "Limit statistik harus berupa angka bulat positif." },
      { status: 400 },
    );
  }

  const result = await listAdminStatistics({
    category: searchParams.get("category") ?? searchParams.get("section") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    status: parsedStatus,
    limit,
  });

  return Response.json({
    data: {
      metrics: result.metrics,
      sections: result.sections,
    },
    meta: {
      totalMetrics: result.metrics.length,
      totalSections: result.sections.length,
      categories: result.categories,
      category: searchParams.get("category") ?? searchParams.get("section") ?? null,
      query: searchParams.get("q") ?? null,
      status: status ?? null,
      limit: limit ?? null,
    },
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isAdminStatisticCreateInput(body)) {
    return Response.json(
      {
        error: "Payload statistik belum lengkap atau tidak valid.",
        required: {
          metric: ["label", "category", "value", "unit"],
          section: ["type=section", "title", "description", "totalValue"],
          chartItem: ["type=chart-item", "sectionId", "label", "value"],
        },
      },
      { status: 400 },
    );
  }

  const result = await createAdminStatisticRecord(body);

  if (!result.ok) {
    const status = result.reason === "missing-section" ? 404 : 409;
    const error = result.reason === "missing-section"
      ? "Kategori grafik statistik tidak ditemukan."
      : "Slug data statistik sudah dipakai.";

    return Response.json({ error, reason: result.reason }, { status });
  }

  return Response.json(
    {
      data: result.data,
      meta: {
        type: result.type,
        section: "section" in result ? result.section : null,
      },
    },
    { status: 201 },
  );
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isAdminStatisticUpdateInput(body)) {
    return Response.json(
      { error: "Payload ubah statistik belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const idOrSlug = body.id ?? body.slug ?? body.sectionId ?? body.section_id;

  if (typeof idOrSlug !== "string" || idOrSlug.trim().length === 0) {
    return Response.json(
      { error: "ID, slug, atau sectionId statistik wajib dikirim." },
      { status: 400 },
    );
  }

  const result = await updateAdminStatisticRecord(idOrSlug, body);

  if (!result) {
    return Response.json(
      { error: "Data statistik tidak ditemukan." },
      { status: 404 },
    );
  }

  return Response.json({
    data: result.data,
    meta: {
      type: result.type,
      section: "section" in result ? result.section : null,
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const records = await resetAdminStatisticRecords();

    return Response.json({
      data: records,
      meta: {
        totalMetrics: records.metrics.length,
        totalSections: records.sections.length,
      },
    });
  }

  const type = parseStatisticType(searchParams.get("type"));

  if (!type) {
    return Response.json(
      { error: "Tipe statistik tidak valid." },
      { status: 400 },
    );
  }

  const result = await deleteAdminStatisticRecord({
    type,
    idOrSlug: searchParams.get("id") ?? searchParams.get("slug") ?? undefined,
    sectionId: searchParams.get("sectionId") ?? searchParams.get("section") ?? undefined,
    itemLabel: searchParams.get("itemLabel") ?? searchParams.get("label") ?? undefined,
  });

  if (!result) {
    return Response.json(
      { error: "Data statistik tidak ditemukan." },
      { status: 404 },
    );
  }

  return Response.json({
    data: result.data,
    meta: {
      type: result.type,
      section: "section" in result ? result.section : null,
    },
  });
}

function parseStatisticType(value: string | null): AdminStatisticCreateType | null {
  if (!value) {
    return "metric";
  }

  if (value === "metric" || value === "section" || value === "chart-item") {
    return value;
  }

  return null;
}