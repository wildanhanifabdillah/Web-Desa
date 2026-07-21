import { getCategoryRecord, listCategoryRecords } from "@/lib/potential-category-store";
import { getPotentialItem, listPotentialItems } from "@/lib/potential-item-store";

const potentialStatuses = new Set(["draft", "published", "archived"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity")?.trim().toLowerCase() ?? "all";
  const category = searchParams.get("category")?.trim().toLowerCase();
  const status = searchParams.get("status")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? searchParams.get("query")?.trim().toLowerCase();
  const idOrSlug = searchParams.get("id")?.trim() ?? searchParams.get("slug")?.trim();
  const limitValue = searchParams.get("limit");

  if (!["all", "categories", "items"].includes(entity)) {
    return Response.json(
      { error: "Entity potensi harus all, categories, atau items." },
      { status: 400 },
    );
  }

  if (status && !potentialStatuses.has(status)) {
    return Response.json({ error: "Status potensi tidak valid." }, { status: 400 });
  }

  let limit: number | undefined;

  if (limitValue) {
    const parsedLimit = Number.parseInt(limitValue, 10);

    if (
      !Number.isInteger(parsedLimit)
      || parsedLimit.toString() !== limitValue.trim()
      || parsedLimit < 1
    ) {
      return Response.json({ error: "Limit potensi harus angka bulat positif." }, { status: 400 });
    }

    limit = parsedLimit;
  }

  if (idOrSlug) {
    if (entity === "categories") {
      const categoryRecord = await getCategoryRecord(idOrSlug.toLowerCase());

      if (!categoryRecord) {
        return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
      }

      return Response.json({ data: categoryRecord });
    }

    const item = await getPotentialItem(idOrSlug);

    if (!item) {
      return Response.json({ error: "Item potensi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: item });
  }

  const [categories, items] = await Promise.all([
    listCategoryRecords(),
    listPotentialItems(),
  ]);
  const categoryMap = new Map(categories.map((item) => [item.slug, item]));

  const filteredCategories = categories.filter((item) => {
    const matchesCategory = category ? item.slug === category : true;
    const matchesQuery = query
      ? [item.slug, item.label, item.title, item.summary, item.detail.intro]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesCategory && matchesQuery;
  });
  const filteredItems = items.filter((item) => {
    const matchesCategory = category ? item.categorySlug === category : true;
    const matchesStatus = status ? item.status === status : true;
    const matchesQuery = query
      ? [item.title, item.slug, item.summary, item.description, item.categorySlug]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesCategory && matchesStatus && matchesQuery;
  });
  const limitedCategories = limit && entity === "categories"
    ? filteredCategories.slice(0, limit)
    : filteredCategories;
  const limitedItems = limit && entity === "items"
    ? filteredItems.slice(0, limit)
    : filteredItems;
  const data = {
    categories: entity === "items" ? [] : limitedCategories,
    items: entity === "categories"
      ? []
      : limitedItems.map((item) => ({
          ...item,
          category: categoryMap.get(item.categorySlug) ?? null,
        })),
  };

  return Response.json({
    data,
    meta: {
      entity,
      totalCategories: data.categories.length,
      totalItems: data.items.length,
      publishedItems: filteredItems.filter((item) => item.status === "published").length,
      draftItems: filteredItems.filter((item) => item.status === "draft").length,
      archivedItems: filteredItems.filter((item) => item.status === "archived").length,
      category: category ?? null,
      status: status ?? null,
      query: query ?? null,
      limit: limit ?? null,
      categories: categories.map((item) => ({
        slug: item.slug,
        label: item.label,
        totalItems: items.filter((potentialItem) => potentialItem.categorySlug === item.slug).length,
      })),
    },
  });
}
