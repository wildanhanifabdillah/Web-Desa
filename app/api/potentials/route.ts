import { listCategoryRecords } from "@/lib/potential-category-store";
import { listPotentialItems } from "@/lib/potential-item-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim().toLowerCase();
  const status = searchParams.get("status")?.trim().toLowerCase() ?? "published";
  const query = searchParams.get("q")?.trim().toLowerCase();
  const [categories, items] = await Promise.all([
    listCategoryRecords(),
    listPotentialItems(),
  ]);

  if (status && !isPotentialStatus(status)) {
    return Response.json(
      { error: "Status potensi tidak valid." },
      { status: 400 },
    );
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
  const categoryMap = new Map(categories.map((item) => [item.slug, item]));
  const data = filteredItems.map((item) => ({
    ...item,
    category: categoryMap.get(item.categorySlug) ?? null,
  }));

  return Response.json({
    data,
    meta: {
      total: data.length,
      totalCategories: categories.length,
      categories: categories.map((item) => ({
        slug: item.slug,
        label: item.label,
        title: item.title,
        totalItems: items.filter((potentialItem) => potentialItem.categorySlug === item.slug).length,
      })),
      category: category ?? null,
      status,
      query: query ?? null,
    },
  });
}

function isPotentialStatus(value: string) {
  return value === "draft" || value === "published" || value === "archived";
}