export type StatisticStatus = "draft" | "published" | "archived";
export type StatisticChartType = "bar" | "pie" | "line";
export type StatisticChangeAction = "create" | "update" | "publish" | "archive" | "delete";

export type StatisticMetricRow = {
  id: string;
  slug: string;
  category: string;
  label: string;
  value_number: number;
  unit: string;
  description: string | null;
  display_order: number;
  is_featured: boolean | 0 | 1;
  status: StatisticStatus;
  source_name: string | null;
  period_label: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StatisticSectionRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_label: string;
  total_value: number;
  unit: string;
  chart_type: StatisticChartType;
  source_name: string | null;
  period_label: string | null;
  display_order: number;
  status: StatisticStatus;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StatisticChartItemRow = {
  id: string;
  section_id: string;
  label: string;
  value_number: number;
  color_token: string;
  source_note: string | null;
  display_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StatisticChangeLogRow = {
  id: string;
  entity_table: string;
  entity_id: string;
  action: StatisticChangeAction;
  change_note: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
};

export type StatisticSectionWithItemsRow = StatisticSectionRow & {
  items: StatisticChartItemRow[];
};

export type StatisticDashboardRecord = {
  metrics: StatisticMetricRow[];
  sections: StatisticSectionWithItemsRow[];
  recentChanges: StatisticChangeLogRow[];
};

export type StatisticMetricInput = {
  slug: string;
  category: string;
  label: string;
  value_number: number;
  unit: string;
  description?: string | null;
  display_order?: number;
  is_featured?: boolean;
  status?: StatisticStatus;
  source_name?: string | null;
  period_label?: string | null;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type StatisticSectionInput = {
  slug: string;
  title: string;
  description: string;
  total_label: string;
  total_value: number;
  unit: string;
  chart_type?: StatisticChartType;
  source_name?: string | null;
  period_label?: string | null;
  display_order?: number;
  status?: StatisticStatus;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type StatisticChartItemInput = {
  section_id: string;
  label: string;
  value_number: number;
  color_token?: string;
  source_note?: string | null;
  display_order?: number;
  created_by?: string | null;
  updated_by?: string | null;
};

export type StatisticListFilters = {
  query?: string;
  category?: string;
  status?: StatisticStatus;
  featuredOnly?: boolean;
  periodLabel?: string;
  limit?: number;
};

export const statisticTableNames = {
  metrics: "data_statistik",
  sections: "statistic_sections",
  chartItems: "statistic_chart_items",
  changeLogs: "statistic_change_logs",
} as const;