export type VillageRegulationStatus = "active" | "archived";

export type VillageRegulationRow = {
  id: string;
  slug: string;
  regulation_number: string;
  title: string;
  year: number;
  category: string;
  summary: string;
  file_type: string;
  file_size_label: string;
  file_url: string | null;
  status: VillageRegulationStatus;
  enacted_at: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type VillageRegulationFilters = {
  query?: string;
  category?: string;
  year?: number;
  status?: VillageRegulationStatus;
  limit?: number;
};

export const villageRegulationTableName = "village_regulations" as const;
