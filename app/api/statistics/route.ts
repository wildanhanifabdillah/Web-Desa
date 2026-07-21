import { listAdminStatistics } from "@/lib/admin-statistics-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? searchParams.get("section");
  const result = await listAdminStatistics({ status: "published" });

  if (category) {
    const normalizedCategory = category.trim().toLowerCase();
    const section = result.sections.find((item) =>
      [item.id, item.slug, item.title].some((value) => value.toLowerCase() === normalizedCategory),
    );

    if (!section) {
      return Response.json(
        {
          error: "Kategori statistik tidak ditemukan.",
          message: "Kategori statistik tidak ditemukan",
        },
        { status: 404 },
      );
    }

    return Response.json({
      data: section,
      meta: {
        category: normalizedCategory,
        totalItems: section.items.length,
      },
    });
  }

  return Response.json({
    data: {
      overview: result.metrics,
      sections: result.sections,
    },
    meta: {
      totalOverview: result.metrics.length,
      totalSections: result.sections.length,
    },
  });
}
