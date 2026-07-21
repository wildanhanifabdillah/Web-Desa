import { listCategoryRecords } from "@/lib/potential-category-store";

export async function GET(request: Request) {
  const categories = await listCategoryRecords();
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase();

  const galleryItems = categories.flatMap((category) =>
    category.gallery.map((item, index) => ({
      id: `${category.slug}-${index + 1}`,
      categorySlug: category.slug,
      categoryLabel: category.label,
      title: item.title,
      description: item.description,
      image: item.image,
      order: index + 1,
    })),
  );

  const filteredByCategory = categorySlug
    ? galleryItems.filter((item) => item.categorySlug === categorySlug)
    : galleryItems;

  const filteredItems = query
    ? filteredByCategory.filter((item) =>
        [item.categoryLabel, item.title, item.description]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : filteredByCategory;

  return Response.json({
    data: filteredItems,
    meta: {
      total: filteredItems.length,
      category: categorySlug ?? null,
      query: query ?? null,
    },
  });
}
