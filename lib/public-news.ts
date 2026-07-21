import {
  getAdminNews,
  listAdminNews,
  type AdminNewsGalleryImage,
  type AdminNewsRecord,
} from "@/lib/admin-news-store";

export type PublicNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  galleryImages: AdminNewsGalleryImage[];
  publishedAt: string;
  authorName: string;
};

export async function getPublicNews() {
  const records = await listAdminNews({ status: "published" });

  return records.map(mapAdminNewsToPublicNews);
}

export async function getPublicNewsBySlug(slug: string) {
  const record = await getAdminNews(slug);

  if (!record || record.status !== "published") {
    return null;
  }

  return mapAdminNewsToPublicNews(record);
}

export async function searchPublicNews({
  query,
  category,
  limit,
}: {
  query?: string | null;
  category?: string | null;
  limit?: number | null;
}) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();
  const news = await getPublicNews();
  const filteredNews = news.filter((item) => {
    const searchableContent = [
      item.title,
      item.excerpt,
      item.content,
      item.category,
      item.authorName,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = normalizedQuery ? searchableContent.includes(normalizedQuery) : true;
    const matchesCategory = normalizedCategory
      ? item.category.toLowerCase() === normalizedCategory
      : true;

    return matchesQuery && matchesCategory;
  });
  const limitedNews = limit && Number.isFinite(limit) && limit > 0
    ? filteredNews.slice(0, limit)
    : filteredNews;

  return {
    data: limitedNews,
    total: limitedNews.length,
    available: filteredNews.length,
    query: normalizedQuery ?? null,
    category: normalizedCategory ?? null,
    limit: limit ?? null,
  };
}

function mapAdminNewsToPublicNews(record: AdminNewsRecord): PublicNewsItem {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    content: record.content,
    category: record.category,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    galleryImages: record.galleryImages ?? [],
    publishedAt: record.publishedAt ?? record.updatedAt,
    authorName: record.authorName,
  };
}

