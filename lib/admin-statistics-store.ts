import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows, type SqlValue } from "@/lib/db";
import type {
  StatisticChartItem,
  StatisticMetric,
  StatisticSection,
} from "@/lib/statistics";
import type { StatisticStatus } from "@/lib/statistics-model";

export type AdminStatisticMetric = StatisticMetric & {
  category: string;
  slug: string;
  status: StatisticStatus;
  sourceName: string;
  periodLabel: string;
  featured: boolean;
};

export type AdminStatisticSection = StatisticSection & {
  slug: string;
  status: StatisticStatus;
  sourceName: string;
  periodLabel: string;
};

export type AdminStatisticCreateType = "metric" | "section" | "chart-item";

export type AdminStatisticCreateInput = {
  type?: AdminStatisticCreateType;
  slug?: string;
  category?: string;
  sectionId?: string;
  section_id?: string;
  label?: string;
  title?: string;
  value?: number;
  value_number?: number;
  totalValue?: number;
  total_value?: number;
  unit?: string;
  description?: string;
  totalLabel?: string;
  total_label?: string;
  colorClassName?: string;
  color_token?: string;
  sourceName?: string;
  source_name?: string;
  periodLabel?: string;
  period_label?: string;
  status?: StatisticStatus;
  featured?: boolean;
};

export type AdminStatisticListFilters = {
  category?: string;
  query?: string;
  status?: StatisticStatus;
  limit?: number;
};

export type AdminStatisticUpdateInput = Partial<AdminStatisticCreateInput> & {
  id?: string;
  itemLabel?: string;
  item_label?: string;
  currentLabel?: string;
  current_label?: string;
};

type MetricSqlRow = RowDataPacket & {
  id: string;
  slug: string;
  category: string;
  label: string;
  value_number: number;
  unit: string;
  description: string | null;
  is_featured: number | boolean;
  status: StatisticStatus;
  source_name: string | null;
  period_label: string | null;
  display_order: number;
};

type SectionSqlRow = RowDataPacket & {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_label: string;
  total_value: number;
  unit: string;
  source_name: string | null;
  period_label: string | null;
  status: StatisticStatus;
  display_order: number;
};

type ChartItemSqlRow = RowDataPacket & {
  id: string;
  section_id: string;
  label: string;
  value_number: number;
  color_token: string;
  display_order: number;
};

export async function listAdminStatistics(filters: AdminStatisticListFilters = {}) {
  const [metricRows, sectionRows] = await Promise.all([
    queryRows<MetricSqlRow>(
      `SELECT id, slug, category, label, value_number, unit, description, is_featured,
              status, source_name, period_label, display_order
       FROM data_statistik
       ORDER BY display_order ASC, label ASC`,
    ),
    queryRows<SectionSqlRow>(
      `SELECT id, slug, title, description, total_label, total_value, unit,
              source_name, period_label, status, display_order
       FROM statistic_sections
       ORDER BY display_order ASC, title ASC`,
    ),
  ]);
  const normalizedCategory = filters.category?.trim().toLowerCase();
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const normalizedStatus = filters.status;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;
  const allMetrics = metricRows.map(mapMetricRow);
  const allSections = await hydrateSectionRows(sectionRows);

  const metrics = allMetrics.filter((metric) => {
    const matchesCategory = normalizedCategory
      ? [metric.category, metric.id, metric.slug].some((value) => value.toLowerCase() === normalizedCategory)
      : true;
    const matchesQuery = normalizedQuery
      ? [metric.category, metric.label, metric.description, metric.unit, metric.slug]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesStatus = normalizedStatus ? metric.status === normalizedStatus : true;

    return matchesCategory && matchesQuery && matchesStatus;
  });

  const sections = allSections.filter((section) => {
    const matchesCategory = normalizedCategory
      ? [section.id, section.slug, section.title].some((value) => value.toLowerCase() === normalizedCategory)
      : true;
    const matchesQuery = normalizedQuery
      ? [section.id, section.title, section.description, section.totalLabel, section.slug]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesStatus = normalizedStatus ? section.status === normalizedStatus : true;

    return matchesCategory && matchesQuery && matchesStatus;
  });

  return {
    metrics: limit ? metrics.slice(0, limit) : metrics,
    sections: limit ? sections.slice(0, limit) : sections,
    categories: getStatisticCategorySummary(allMetrics, allSections),
  };
}

export async function createAdminStatisticRecord(input: AdminStatisticCreateInput) {
  const type = input.type ?? "metric";

  if (type === "section") {
    const title = input.title?.trim() || input.label?.trim() || "";
    const slug = normalizeSlug(input.slug?.trim() || title);
    const existing = await getSectionRow(slug);

    if (existing) {
      return { ok: false as const, reason: "duplicate-section" as const };
    }

    const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
      "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM statistic_sections",
    );
    const id = crypto.randomUUID();

    await executeSql(
      `INSERT INTO statistic_sections
       (id, slug, title, description, total_label, total_value, unit, chart_type, source_name, period_label, display_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'bar', ?, ?, ?, ?)`,
      [
        id,
        slug,
        title,
        input.description?.trim() ?? "",
        input.totalLabel ?? input.total_label ?? "Total data",
        input.totalValue ?? input.total_value ?? input.value ?? input.value_number ?? 0,
        input.unit?.trim() || "orang",
        input.sourceName ?? input.source_name ?? "Input admin statistik",
        input.periodLabel ?? input.period_label ?? "2026",
        orderRows[0]?.next_order ?? 1,
        input.status ?? "draft",
      ],
    );

    return { ok: true as const, type, data: await getSectionRecord(slug) };
  }

  if (type === "chart-item") {
    const sectionId = input.sectionId ?? input.section_id;
    const section = sectionId ? await getSectionRow(sectionId) : null;

    if (!section) {
      return { ok: false as const, reason: "missing-section" as const };
    }

    const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
      "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM statistic_chart_items WHERE section_id = ?",
      [section.id],
    );
    const item: StatisticChartItem = {
      label: input.label?.trim() ?? input.title?.trim() ?? "Item statistik baru",
      value: input.value ?? input.value_number ?? 0,
      colorClassName: input.colorClassName ?? input.color_token ?? "bg-sage-600",
    };

    await executeSql(
      `INSERT INTO statistic_chart_items (id, section_id, label, value_number, color_token, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), section.id, item.label, item.value, item.colorClassName, orderRows[0]?.next_order ?? 1],
    );

    return { ok: true as const, type, data: item, section: await getSectionRecord(section.slug) };
  }

  const label = input.label?.trim() || input.title?.trim() || "";
  const slug = normalizeSlug(input.slug?.trim() || label);
  const existing = await getMetricRow(slug);

  if (existing) {
    return { ok: false as const, reason: "duplicate-metric" as const };
  }

  const orderRows = await queryRows<RowDataPacket & { next_order: number }>(
    "SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM data_statistik",
  );

  await executeSql(
    `INSERT INTO data_statistik
     (id, slug, category, label, value_number, unit, description, display_order, is_featured, status, source_name, period_label)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      slug,
      input.category?.trim() || "Umum",
      label,
      input.value ?? input.value_number ?? 0,
      input.unit?.trim() || "orang",
      input.description?.trim() || "Data statistik baru dari admin.",
      orderRows[0]?.next_order ?? 1,
      input.featured ?? false,
      input.status ?? "draft",
      input.sourceName ?? input.source_name ?? "Input admin statistik",
      input.periodLabel ?? input.period_label ?? "2026",
    ],
  );

  return { ok: true as const, type, data: await getMetricRecord(slug) };
}

export async function updateAdminStatisticRecord(idOrSlug: string, input: AdminStatisticUpdateInput) {
  const type = input.type ?? "metric";

  if (type === "section") {
    const currentRow = await getSectionRow(idOrSlug);

    if (!currentRow) {
      return null;
    }

    const current = (await hydrateSectionRows([currentRow]))[0];
    const nextSlug = input.slug ? normalizeSlug(input.slug) : current.slug;

    if (nextSlug !== current.slug && await getSectionRow(nextSlug)) {
      return null;
    }

    await executeSql(
      `UPDATE statistic_sections
       SET slug = ?, title = ?, description = ?, total_label = ?, total_value = ?, unit = ?,
           status = ?, source_name = ?, period_label = ?
       WHERE id = ?`,
      [
        nextSlug,
        input.title?.trim() ?? input.label?.trim() ?? current.title,
        input.description?.trim() ?? current.description,
        input.totalLabel ?? input.total_label ?? current.totalLabel,
        input.totalValue ?? input.total_value ?? input.value ?? input.value_number ?? current.totalValue,
        input.unit?.trim() ?? current.unit,
        input.status ?? current.status,
        input.sourceName ?? input.source_name ?? current.sourceName,
        input.periodLabel ?? input.period_label ?? current.periodLabel,
        currentRow.id,
      ],
    );

    return { type, data: await getSectionRecord(nextSlug) };
  }

  if (type === "chart-item") {
    const sectionId = input.sectionId ?? input.section_id ?? idOrSlug;
    const itemLabel = input.itemLabel ?? input.item_label ?? input.currentLabel ?? input.current_label;
    const section = await getSectionRow(sectionId);

    if (!section || !itemLabel) {
      return null;
    }

    const itemRows = await queryRows<ChartItemSqlRow>(
      `SELECT id, section_id, label, value_number, color_token, display_order
       FROM statistic_chart_items
       WHERE section_id = ? AND label = ?
       ORDER BY display_order ASC
       LIMIT 1`,
      [section.id, itemLabel],
    );
    const item = itemRows[0];

    if (!item) {
      return null;
    }

    const updatedItem: StatisticChartItem = {
      label: input.label?.trim() ?? input.title?.trim() ?? item.label,
      value: input.value ?? input.value_number ?? Number(item.value_number),
      colorClassName: input.colorClassName ?? input.color_token ?? item.color_token,
    };

    await executeSql(
      "UPDATE statistic_chart_items SET label = ?, value_number = ?, color_token = ? WHERE id = ?",
      [updatedItem.label, updatedItem.value, updatedItem.colorClassName, item.id],
    );

    return { type, data: updatedItem, section: await getSectionRecord(section.slug) };
  }

  const currentRow = await getMetricRow(idOrSlug);

  if (!currentRow) {
    return null;
  }

  const current = mapMetricRow(currentRow);
  const nextSlug = input.slug ? normalizeSlug(input.slug) : current.slug;

  if (nextSlug !== current.slug && await getMetricRow(nextSlug)) {
    return null;
  }

  await executeSql(
    `UPDATE data_statistik
     SET slug = ?, label = ?, value_number = ?, unit = ?, description = ?, category = ?,
         status = ?, source_name = ?, period_label = ?, is_featured = ?
     WHERE id = ?`,
    [
      nextSlug,
      input.label?.trim() ?? input.title?.trim() ?? current.label,
      input.value ?? input.value_number ?? current.value,
      input.unit?.trim() ?? current.unit,
      input.description?.trim() ?? current.description,
      input.category?.trim() ?? current.category,
      input.status ?? current.status,
      input.sourceName ?? input.source_name ?? current.sourceName,
      input.periodLabel ?? input.period_label ?? current.periodLabel,
      input.featured ?? current.featured,
      currentRow.id,
    ],
  );

  return { type, data: await getMetricRecord(nextSlug) };
}

export async function deleteAdminStatisticRecord({
  type = "metric",
  idOrSlug,
  sectionId,
  itemLabel,
}: {
  type?: AdminStatisticCreateType;
  idOrSlug?: string;
  sectionId?: string;
  itemLabel?: string;
}) {
  if (type === "section") {
    if (!idOrSlug) {
      return null;
    }

    const row = await getSectionRow(idOrSlug);

    if (!row) {
      return null;
    }

    const section = (await hydrateSectionRows([row]))[0];
    await executeSql("DELETE FROM statistic_sections WHERE id = ?", [row.id]);

    return { type, data: section };
  }

  if (type === "chart-item") {
    if (!sectionId || !itemLabel) {
      return null;
    }

    const section = await getSectionRow(sectionId);

    if (!section) {
      return null;
    }

    const rows = await queryRows<ChartItemSqlRow>(
      `SELECT id, section_id, label, value_number, color_token, display_order
       FROM statistic_chart_items
       WHERE section_id = ? AND label = ?
       ORDER BY display_order ASC
       LIMIT 1`,
      [section.id, itemLabel],
    );
    const item = rows[0];

    if (!item) {
      return null;
    }

    await executeSql("DELETE FROM statistic_chart_items WHERE id = ?", [item.id]);

    return {
      type,
      data: mapChartItemRow(item),
      section: await getSectionRecord(section.slug),
    };
  }

  if (!idOrSlug) {
    return null;
  }

  const row = await getMetricRow(idOrSlug);

  if (!row) {
    return null;
  }

  const metric = mapMetricRow(row);
  await executeSql("DELETE FROM data_statistik WHERE id = ?", [row.id]);

  return { type, data: metric };
}

export async function resetAdminStatisticRecords() {
  await executeSql("DELETE FROM statistic_chart_items");
  await executeSql("DELETE FROM statistic_sections");
  await executeSql("DELETE FROM data_statistik");

  return listAdminStatistics();
}

export function isAdminStatisticUpdateInput(value: unknown): value is AdminStatisticUpdateInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AdminStatisticUpdateInput;
  const type = candidate.type ?? "metric";

  if (candidate.status && !isStatisticStatus(candidate.status)) {
    return false;
  }

  return type === "metric" || type === "section" || type === "chart-item";
}

export function isAdminStatisticCreateInput(value: unknown): value is AdminStatisticCreateInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AdminStatisticCreateInput;
  const type = candidate.type ?? "metric";

  if (candidate.status && !isStatisticStatus(candidate.status)) {
    return false;
  }

  if (type !== "metric" && type !== "section" && type !== "chart-item") {
    return false;
  }

  if (type === "chart-item") {
    return hasText(candidate.sectionId ?? candidate.section_id)
      && hasText(candidate.label ?? candidate.title)
      && hasFiniteNumber(candidate.value ?? candidate.value_number);
  }

  if (type === "section") {
    return hasText(candidate.title ?? candidate.label)
      && hasText(candidate.description)
      && hasFiniteNumber(candidate.totalValue ?? candidate.total_value ?? candidate.value ?? candidate.value_number);
  }

  return hasText(candidate.label ?? candidate.title)
    && hasText(candidate.category)
    && hasFiniteNumber(candidate.value ?? candidate.value_number)
    && hasText(candidate.unit);
}

export function isStatisticStatus(value: string | null | undefined): value is StatisticStatus {
  return value === "draft" || value === "published" || value === "archived";
}

async function getMetricRow(idOrSlug: string) {
  const rows = await queryRows<MetricSqlRow>(
    `SELECT id, slug, category, label, value_number, unit, description, is_featured,
            status, source_name, period_label, display_order
     FROM data_statistik
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

async function getMetricRecord(idOrSlug: string) {
  const row = await getMetricRow(idOrSlug);

  return row ? mapMetricRow(row) : null;
}

async function getSectionRow(idOrSlug: string) {
  const rows = await queryRows<SectionSqlRow>(
    `SELECT id, slug, title, description, total_label, total_value, unit,
            source_name, period_label, status, display_order
     FROM statistic_sections
     WHERE id = ? OR slug = ?
     LIMIT 1`,
    [idOrSlug, idOrSlug],
  );

  return rows[0] ?? null;
}

async function getSectionRecord(idOrSlug: string) {
  const row = await getSectionRow(idOrSlug);
  const sections = row ? await hydrateSectionRows([row]) : [];

  return sections[0] ?? null;
}

async function hydrateSectionRows(rows: SectionSqlRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const sectionIds = rows.map((row) => row.id);
  const placeholders = sectionIds.map(() => "?").join(", ");
  const itemRows = await queryRows<ChartItemSqlRow>(
    `SELECT id, section_id, label, value_number, color_token, display_order
     FROM statistic_chart_items
     WHERE section_id IN (${placeholders})
     ORDER BY display_order ASC, label ASC`,
    sectionIds as SqlValue[],
  );
  const itemsBySection = new Map<string, StatisticChartItem[]>();

  for (const item of itemRows) {
    const current = itemsBySection.get(item.section_id) ?? [];
    current.push(mapChartItemRow(item));
    itemsBySection.set(item.section_id, current);
  }

  return rows.map((row) => mapSectionRow(row, itemsBySection.get(row.id) ?? []));
}

function mapMetricRow(row: MetricSqlRow): AdminStatisticMetric {
  return {
    id: row.slug,
    slug: row.slug,
    label: row.label,
    value: Number(row.value_number),
    unit: row.unit,
    description: row.description ?? "",
    category: row.category,
    status: row.status,
    sourceName: row.source_name ?? "Data Desa Keseneng",
    periodLabel: row.period_label ?? "2026",
    featured: Boolean(row.is_featured),
  };
}

function mapSectionRow(row: SectionSqlRow, items: StatisticChartItem[]): AdminStatisticSection {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    description: row.description,
    totalLabel: row.total_label,
    totalValue: Number(row.total_value),
    unit: row.unit,
    items,
    status: row.status,
    sourceName: row.source_name ?? "Data Desa Keseneng",
    periodLabel: row.period_label ?? "2026",
  };
}

function mapChartItemRow(row: ChartItemSqlRow): StatisticChartItem {
  return {
    label: row.label,
    value: Number(row.value_number),
    colorClassName: row.color_token,
  };
}

function getStatisticCategorySummary(metrics: AdminStatisticMetric[], sections: AdminStatisticSection[]) {
  const metricCategories = Array.from(new Set(metrics.map((metric) => metric.category))).map((category) => ({
    type: "metric" as const,
    slug: normalizeSlug(category),
    label: category,
    total: metrics.filter((metric) => metric.category === category).length,
  }));
  const sectionCategories = sections.map((section) => ({
    type: "section" as const,
    slug: section.slug,
    label: section.title,
    total: section.items.length,
  }));

  return [...metricCategories, ...sectionCategories];
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
