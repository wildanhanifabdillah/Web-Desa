import {
  isStatisticStatus,
  listAdminStatistics,
} from "@/lib/admin-statistics-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const limitValue = searchParams.get("limit");

  if (status && !isStatisticStatus(status)) {
    return Response.json({ error: "Status statistik tidak valid." }, { status: 400 });
  }

  let limit: number | undefined;

  if (limitValue) {
    const parsedLimit = Number.parseInt(limitValue, 10);

    if (
      !Number.isInteger(parsedLimit)
      || parsedLimit.toString() !== limitValue.trim()
      || parsedLimit < 1
    ) {
      return Response.json({ error: "Limit statistik harus angka bulat positif." }, { status: 400 });
    }

    limit = parsedLimit;
  }

  const result = await listAdminStatistics({
    category: searchParams.get("category") ?? searchParams.get("section") ?? undefined,
    query: searchParams.get("q") ?? searchParams.get("query") ?? undefined,
    status: status && isStatisticStatus(status) ? status : undefined,
    limit,
  });

  if (idOrSlug) {
    const metric = result.metrics.find(
      (item) => item.id === idOrSlug || item.slug === idOrSlug,
    );
    const section = result.sections.find(
      (item) => item.id === idOrSlug || item.slug === idOrSlug,
    );
    const record = metric ?? section ?? null;

    if (!record) {
      return Response.json({ error: "Data statistik desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  return Response.json({
    data: {
      metrics: result.metrics,
      sections: result.sections,
      categories: result.categories,
    },
    meta: {
      totalMetrics: result.metrics.length,
      totalSections: result.sections.length,
      totalCategories: result.categories.length,
      published: [
        ...result.metrics,
        ...result.sections,
      ].filter((item) => item.status === "published").length,
      draft: [
        ...result.metrics,
        ...result.sections,
      ].filter((item) => item.status === "draft").length,
      archived: [
        ...result.metrics,
        ...result.sections,
      ].filter((item) => item.status === "archived").length,
      category: searchParams.get("category") ?? searchParams.get("section") ?? null,
      query: searchParams.get("q") ?? searchParams.get("query") ?? null,
      status: status ?? null,
      limit: limit ?? null,
    },
  });
}
