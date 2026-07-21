export type TransparencyStatus = "draft" | "published" | "archived";

export type TransparencyDocumentRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  file_type: string;
  file_size_label: string;
  file_url: string | null;
  status: TransparencyStatus;
  published_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type TransparencyDocumentFilters = {
  category?: string;
  year?: number;
  status?: TransparencyStatus;
  limit?: number;
};

export const transparencyTableName = "transparency_documents" as const;
