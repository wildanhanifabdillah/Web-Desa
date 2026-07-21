export type PotentialCategoryStatus = "draft" | "published" | "archived";
export type PotentialItemStatus = "draft" | "published" | "archived";
export type PotentialChangeAction = "create" | "update" | "publish" | "archive" | "delete";

export type PotentialCategoryRow = {
  id: string;
  slug: string;
  label: string;
  title: string;
  summary: string;
  image_url: string;
  accent_class_name: string;
  stat_value: string;
  stat_label: string;
  detail_eyebrow: string;
  detail_intro: string;
  detail_description: string;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  display_order: number;
  is_active: boolean | 0 | 1;
  status: PotentialCategoryStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PotentialCategoryInput = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  image_url: string;
  accent_class_name?: string;
  stat_value?: string;
  stat_label?: string;
  detail_eyebrow?: string;
  detail_intro: string;
  detail_description: string;
  contact_name?: string;
  contact_role?: string;
  contact_email?: string;
  display_order?: number;
  is_active?: boolean;
  status?: PotentialCategoryStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type PotentialItemRow = {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string;
  image_alt: string;
  seo_title: string | null;
  seo_description: string | null;
  status: PotentialItemStatus;
  is_featured: boolean | 0 | 1;
  published_at: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  display_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PotentialItemInput = {
  category_id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string;
  image_alt: string;
  seo_title?: string | null;
  seo_description?: string | null;
  status?: PotentialItemStatus;
  is_featured?: boolean;
  published_at?: string | null;
  contact_name?: string | null;
  contact_role?: string | null;
  contact_email?: string | null;
  display_order?: number;
  created_by?: string | null;
  updated_by?: string | null;
};

export type PotentialHighlightRow = {
  id: string;
  category_id: string;
  label: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PotentialOpportunityRow = {
  id: string;
  category_id: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PotentialProgramRow = {
  id: string;
  category_id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PotentialGalleryItemRow = {
  id: string;
  category_id: string;
  potential_item_id: string | null;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PotentialCategoryChangeLogRow = {
  id: string;
  category_id: string | null;
  action: PotentialChangeAction;
  change_note: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};

export type PotentialItemChangeLogRow = {
  id: string;
  item_id: string | null;
  category_id: string | null;
  action: PotentialChangeAction;
  change_note: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};

export type PotentialCategoryRecord = {
  category: PotentialCategoryRow;
  items: PotentialItemRow[];
  highlights: PotentialHighlightRow[];
  opportunities: PotentialOpportunityRow[];
  programs: PotentialProgramRow[];
  gallery: PotentialGalleryItemRow[];
};

export type PotentialCategoryFilters = {
  query?: string;
  status?: PotentialCategoryStatus;
  activeOnly?: boolean;
  limit?: number;
};

export type PotentialItemFilters = {
  categoryId?: string;
  query?: string;
  status?: PotentialItemStatus;
  featuredOnly?: boolean;
  limit?: number;
};

export const potentialTableNames = {
  categories: "potential_categories",
  items: "potential_items",
  highlights: "potential_highlights",
  opportunities: "potential_opportunities",
  programs: "potential_programs",
  galleryItems: "potential_gallery_items",
  categoryChangeLogs: "potential_category_change_logs",
  itemChangeLogs: "potential_item_change_logs",
} as const;