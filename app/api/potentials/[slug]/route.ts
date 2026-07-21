import { getCategoryRecord } from "@/lib/potential-category-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const category = await getCategoryRecord(slug);

  if (!category) {
    return Response.json({ error: "Detail potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({
    data: {
      slug: category.slug,
      label: category.label,
      title: category.title,
      summary: category.summary,
      image: category.image,
      detail: category.detail,
      gallery: category.gallery.map((item, index) => ({
        id: `${category.slug}-${index + 1}`,
        ...item,
        order: index + 1,
      })),
      stats: category.stats,
      highlights: category.highlights,
      accentClassName: category.accentClassName,
    },
  });
}
