import type { RowDataPacket } from "mysql2";
import { queryRows, type SqlValue } from "@/lib/db";

export type StatisticMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  description: string;
};

export type StatisticChartItem = {
  label: string;
  value: number;
  colorClassName: string;
};

export type StatisticSection = {
  id: string;
  title: string;
  description: string;
  totalLabel: string;
  totalValue: number;
  unit: string;
  items: StatisticChartItem[];
};

type StatisticMetricRow = RowDataPacket & {
  slug: string;
  label: string;
  value_number: number;
  unit: string;
  description: string | null;
};

type StatisticSectionRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_label: string;
  total_value: number;
  unit: string;
};

type StatisticChartItemRow = RowDataPacket & {
  section_id: string;
  label: string;
  value_number: number;
  color_token: string;
};

export async function getVillageStatisticsOverview() {
  const rows = await queryRows<StatisticMetricRow>(
    `SELECT slug, label, value_number, unit, description
     FROM data_statistik
     WHERE status = 'published' AND is_featured = TRUE
     ORDER BY display_order ASC, label ASC`,
  );

  return rows.map(mapMetricRow);
}

export async function getVillageStatisticSections() {
  const sections = await queryRows<StatisticSectionRow>(
    `SELECT id, slug, title, description, total_label, total_value, unit
     FROM statistic_sections
     WHERE status = 'published'
     ORDER BY display_order ASC, title ASC`,
  );

  return hydrateSections(sections);
}

export async function getVillageStatisticSectionByCategory(category: string) {
  const normalizedCategory = category.trim().toLowerCase();
  const rows = await queryRows<StatisticSectionRow>(
    `SELECT id, slug, title, description, total_label, total_value, unit
     FROM statistic_sections
     WHERE status = 'published' AND (LOWER(slug) = ? OR LOWER(title) = ?)
     LIMIT 1`,
    [normalizedCategory, normalizedCategory],
  );
  const sections = await hydrateSections(rows);

  return sections[0] ?? null;
}

async function hydrateSections(rows: StatisticSectionRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const sectionIds = rows.map((row) => row.id);
  const placeholders = sectionIds.map(() => "?").join(", ");
  const items = await queryRows<StatisticChartItemRow>(
    `SELECT section_id, label, value_number, color_token
     FROM statistic_chart_items
     WHERE section_id IN (${placeholders})
     ORDER BY display_order ASC, label ASC`,
    sectionIds as SqlValue[],
  );
  const itemsBySection = new Map<string, StatisticChartItem[]>();

  for (const item of items) {
    const current = itemsBySection.get(item.section_id) ?? [];
    current.push({
      label: item.label,
      value: Number(item.value_number),
      colorClassName: item.color_token,
    });
    itemsBySection.set(item.section_id, current);
  }

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    description: row.description,
    totalLabel: row.total_label,
    totalValue: Number(row.total_value),
    unit: row.unit,
    items: itemsBySection.get(row.id) ?? [],
  }));
}

function mapMetricRow(row: StatisticMetricRow): StatisticMetric {
  return {
    id: row.slug,
    label: row.label,
    value: Number(row.value_number),
    unit: row.unit,
    description: row.description ?? "",
  };
}
