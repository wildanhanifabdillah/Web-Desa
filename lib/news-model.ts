export type NewsStatus = "draft" | "published" | "archived";

export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_image_alt: string;
  category: string;
  author_name: string;
  is_ai_generated: boolean | 0 | 1;
  status: NewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsListFilters = {
  query?: string;
  category?: string;
  status?: NewsStatus;
  limit?: number;
};

export const newsTableName = "berita" as const;
