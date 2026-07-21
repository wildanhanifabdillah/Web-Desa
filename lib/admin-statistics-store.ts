import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";
import {
  getVillageStatisticSections,
  getVillageStatisticsOverview,
  type StatisticChartItem,
  type StatisticMetric,
  type StatisticSection,
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

const metricCategories: Record<string, string> = {
  penduduk: "Kependudukan",
  "kepala-keluarga": "Kependudukan",
  dusun: "Kewilayahan",
  "rt-rw": "Kewilayahan",
};

let adminStatisticRecords: {
  metrics: AdminStatisticMetric[];
  sections: AdminStatisticSection[];
} | null = null;

async function ensureAdminStatisticRecords() {
  if (!adminStatisticRecords) {
    adminStatisticRecords = loadJsonFile("admin-statistics.json", await getInitialAdminStatisticRecords());
  }

  return adminStatisticRecords ?? { metrics: [], sections: [] };
}

async function getInitialAdminStatisticRecords() {
  const [overview, sections] = await Promise.all([
    getVillageStatisticsOverview(),
    getVillageStatisticSections(),
  ]);

  return {
    metrics: overview.map(serializeMetric),
    sections: sections.map(serializeSection),
  };
}

function saveAdminStatisticRecords(records: {
  metrics: AdminStatisticMetric[];
  sections: AdminStatisticSection[];
}) {
  adminStatisticRecords = records;
  saveJsonFile("admin-statistics.json", records);
}

export async function listAdminStatistics(filters: AdminStatisticListFilters = {}) {
  const records = await ensureAdminStatisticRecords();
  const normalizedCategory = filters.category?.trim().toLowerCase();
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const normalizedStatus = filters.status;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : undefined;

  const metrics = records.metrics.filter((metric) => {
    const matchesCategory = normalizedCategory
      ? [metric.category, metric.id, metric.slug].some((value) =>
          value.toLowerCase() === normalizedCategory,
        )
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

  const sections = records.sections.filter((section) => {
    const matchesCategory = normalizedCategory
      ? [section.id, section.slug, section.title].some((value) =>
          value.toLowerCase() === normalizedCategory,
        )
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
    categories: getStatisticCategorySummary(records.metrics, records.sections),
  };
}

export async function createAdminStatisticRecord(input: AdminStatisticCreateInput) {
  const records = await ensureAdminStatisticRecords();
  const type = input.type ?? "metric";

  if (type === "section") {
    const title = input.title?.trim() || input.label?.trim() || "";
    const slug = normalizeSlug(input.slug ?? title);

    if (records.sections.some((section) => section.slug === slug || section.id === slug)) {
      return { ok: false as const, reason: "duplicate-section" as const };
    }

    const section: AdminStatisticSection = {
      id: slug,
      slug,
      title,
      description: input.description?.trim() ?? "",
      totalLabel: input.totalLabel ?? input.total_label ?? "Total data",
      totalValue: input.totalValue ?? input.total_value ?? input.value ?? input.value_number ?? 0,
      unit: input.unit?.trim() || "orang",
      items: [],
      status: input.status ?? "draft",
      sourceName: input.sourceName ?? input.source_name ?? "Input admin statistik",
      periodLabel: input.periodLabel ?? input.period_label ?? "2026",
    };

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: [...records.sections, section],
    });

    return { ok: true as const, type, data: section };
  }

  if (type === "chart-item") {
    const sectionId = input.sectionId ?? input.section_id;
    const section = records.sections.find(
      (candidate) => candidate.id === sectionId || candidate.slug === sectionId,
    );

    if (!section) {
      return { ok: false as const, reason: "missing-section" as const };
    }

    const item: StatisticChartItem = {
      label: input.label?.trim() ?? input.title?.trim() ?? "Item statistik baru",
      value: input.value ?? input.value_number ?? 0,
      colorClassName: input.colorClassName ?? input.color_token ?? "bg-sage-600",
    };
    const updatedSection = {
      ...section,
      items: [...section.items, item],
    };

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: records.sections.map((candidate) =>
        candidate.id === section.id ? updatedSection : candidate,
      ),
    });

    return { ok: true as const, type, data: item, section: updatedSection };
  }

  const label = input.label?.trim() || input.title?.trim() || "";
  const slug = normalizeSlug(input.slug ?? label);

  if (records.metrics.some((metric) => metric.slug === slug || metric.id === slug)) {
    return { ok: false as const, reason: "duplicate-metric" as const };
  }

  const metric: AdminStatisticMetric = {
    id: slug,
    slug,
    label,
    value: input.value ?? input.value_number ?? 0,
    unit: input.unit?.trim() || "orang",
    description: input.description?.trim() || "Data statistik baru dari admin.",
    category: input.category?.trim() || "Umum",
    status: input.status ?? "draft",
    sourceName: input.sourceName ?? input.source_name ?? "Input admin statistik",
    periodLabel: input.periodLabel ?? input.period_label ?? "2026",
    featured: input.featured ?? false,
  };

  saveAdminStatisticRecords({
    metrics: [...records.metrics, metric],
    sections: records.sections,
  });

  return { ok: true as const, type, data: metric };
}

export type AdminStatisticUpdateInput = Partial<AdminStatisticCreateInput> & {
  id?: string;
  itemLabel?: string;
  item_label?: string;
  currentLabel?: string;
  current_label?: string;
};

export async function updateAdminStatisticRecord(
  idOrSlug: string,
  input: AdminStatisticUpdateInput,
) {
  const records = await ensureAdminStatisticRecords();
  const type = input.type ?? "metric";

  if (type === "section") {
    const existingSection = records.sections.find(
      (section) => section.id === idOrSlug || section.slug === idOrSlug,
    );

    if (!existingSection) {
      return null;
    }

    const updatedSection: AdminStatisticSection = {
      ...existingSection,
      slug: input.slug ? normalizeSlug(input.slug) : existingSection.slug,
      title: input.title?.trim() ?? input.label?.trim() ?? existingSection.title,
      description: input.description?.trim() ?? existingSection.description,
      totalLabel: input.totalLabel ?? input.total_label ?? existingSection.totalLabel,
      totalValue: input.totalValue ?? input.total_value ?? input.value ?? input.value_number ?? existingSection.totalValue,
      unit: input.unit?.trim() ?? existingSection.unit,
      status: input.status ?? existingSection.status,
      sourceName: input.sourceName ?? input.source_name ?? existingSection.sourceName,
      periodLabel: input.periodLabel ?? input.period_label ?? existingSection.periodLabel,
    };

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: records.sections.map((section) =>
        section.id === existingSection.id ? updatedSection : section,
      ),
    });

    return { type, data: updatedSection };
  }

  if (type === "chart-item") {
    const sectionId = input.sectionId ?? input.section_id ?? idOrSlug;
    const itemLabel = input.itemLabel ?? input.item_label ?? input.currentLabel ?? input.current_label;
    const existingSection = records.sections.find(
      (section) => section.id === sectionId || section.slug === sectionId,
    );

    if (!existingSection || !itemLabel) {
      return null;
    }

    const existingItem = existingSection.items.find((item) => item.label === itemLabel);

    if (!existingItem) {
      return null;
    }

    const updatedItem: StatisticChartItem = {
      ...existingItem,
      label: input.label?.trim() ?? input.title?.trim() ?? existingItem.label,
      value: input.value ?? input.value_number ?? existingItem.value,
      colorClassName: input.colorClassName ?? input.color_token ?? existingItem.colorClassName,
    };
    const updatedSection: AdminStatisticSection = {
      ...existingSection,
      items: existingSection.items.map((item) =>
        item.label === existingItem.label ? updatedItem : item,
      ),
    };

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: records.sections.map((section) =>
        section.id === existingSection.id ? updatedSection : section,
      ),
    });

    return { type, data: updatedItem, section: updatedSection };
  }

  const existingMetric = records.metrics.find(
    (metric) => metric.id === idOrSlug || metric.slug === idOrSlug,
  );

  if (!existingMetric) {
    return null;
  }

  const updatedMetric: AdminStatisticMetric = {
    ...existingMetric,
    slug: input.slug ? normalizeSlug(input.slug) : existingMetric.slug,
    label: input.label?.trim() ?? input.title?.trim() ?? existingMetric.label,
    value: input.value ?? input.value_number ?? existingMetric.value,
    unit: input.unit?.trim() ?? existingMetric.unit,
    description: input.description?.trim() ?? existingMetric.description,
    category: input.category?.trim() ?? existingMetric.category,
    status: input.status ?? existingMetric.status,
    sourceName: input.sourceName ?? input.source_name ?? existingMetric.sourceName,
    periodLabel: input.periodLabel ?? input.period_label ?? existingMetric.periodLabel,
    featured: input.featured ?? existingMetric.featured,
  };

  saveAdminStatisticRecords({
    metrics: records.metrics.map((metric) =>
      metric.id === existingMetric.id ? updatedMetric : metric,
    ),
    sections: records.sections,
  });

  return { type, data: updatedMetric };
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
  const records = await ensureAdminStatisticRecords();

  if (type === "section") {
    if (!idOrSlug) {
      return null;
    }

    const existingSection = records.sections.find(
      (section) => section.id === idOrSlug || section.slug === idOrSlug,
    );

    if (!existingSection) {
      return null;
    }

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: records.sections.filter((section) => section.id !== existingSection.id),
    });

    return { type, data: existingSection };
  }

  if (type === "chart-item") {
    if (!sectionId || !itemLabel) {
      return null;
    }

    const existingSection = records.sections.find(
      (section) => section.id === sectionId || section.slug === sectionId,
    );

    if (!existingSection) {
      return null;
    }

    const existingItem = existingSection.items.find((item) => item.label === itemLabel);

    if (!existingItem) {
      return null;
    }

    const updatedSection: AdminStatisticSection = {
      ...existingSection,
      items: existingSection.items.filter((item) => item.label !== existingItem.label),
    };

    saveAdminStatisticRecords({
      metrics: records.metrics,
      sections: records.sections.map((section) =>
        section.id === existingSection.id ? updatedSection : section,
      ),
    });

    return { type, data: existingItem, section: updatedSection };
  }

  if (!idOrSlug) {
    return null;
  }

  const existingMetric = records.metrics.find(
    (metric) => metric.id === idOrSlug || metric.slug === idOrSlug,
  );

  if (!existingMetric) {
    return null;
  }

  saveAdminStatisticRecords({
    metrics: records.metrics.filter((metric) => metric.id !== existingMetric.id),
    sections: records.sections,
  });

  return { type, data: existingMetric };
}

export async function resetAdminStatisticRecords() {
  adminStatisticRecords = resetJsonFile("admin-statistics.json", await getInitialAdminStatisticRecords());

  return adminStatisticRecords ?? { metrics: [], sections: [] };
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

  if (type !== "metric" && type !== "section" && type !== "chart-item") {
    return false;
  }

  return true;
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
    return (
      hasText(candidate.sectionId ?? candidate.section_id) &&
      hasText(candidate.label ?? candidate.title) &&
      hasFiniteNumber(candidate.value ?? candidate.value_number)
    );
  }

  if (type === "section") {
    return (
      hasText(candidate.title ?? candidate.label) &&
      hasText(candidate.description) &&
      hasFiniteNumber(candidate.totalValue ?? candidate.total_value ?? candidate.value ?? candidate.value_number)
    );
  }

  return (
    hasText(candidate.label ?? candidate.title) &&
    hasText(candidate.category) &&
    hasFiniteNumber(candidate.value ?? candidate.value_number) &&
    hasText(candidate.unit)
  );
}

export function isStatisticStatus(value: string | null | undefined): value is StatisticStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function serializeMetric(metric: StatisticMetric): AdminStatisticMetric {
  return {
    ...metric,
    category: metricCategories[metric.id] ?? "Umum",
    slug: metric.id,
    status: "published",
    sourceName: "Data awal Desa Keseneng",
    periodLabel: "2026",
    featured: true,
  };
}

function serializeSection(section: StatisticSection): AdminStatisticSection {
  return {
    ...section,
    slug: section.id,
    status: "published",
    sourceName: "Data awal Desa Keseneng",
    periodLabel: "2026",
  };
}

function getStatisticCategorySummary(
  metrics: AdminStatisticMetric[],
  sections: AdminStatisticSection[],
) {
  const metricCategories = Array.from(new Set(metrics.map((metric) => metric.category))).map(
    (category) => ({
      type: "metric" as const,
      slug: normalizeSlug(category),
      label: category,
      total: metrics.filter((metric) => metric.category === category).length,
    }),
  );
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


