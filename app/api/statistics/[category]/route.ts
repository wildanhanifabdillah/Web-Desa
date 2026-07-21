import { listAdminStatistics } from "@/lib/admin-statistics-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  const normalizedCategory = category.trim().toLowerCase();
  const result = await listAdminStatistics({ status: "published" });
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
      category,
      totalItems: section.items.length,
    },
  });
}
