import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type HomepageProfileSummary = {
  id: string;
  heading: string;
  body: string;
  location: {
    village: string;
    district: string;
    regency: string;
    province: string;
  };
  highlight: {
    label: string;
    value: string;
  };
  cta: {
    label: string;
    href: string;
  };
};

export type HomepageProfileSummaryInput = Omit<HomepageProfileSummary, "id">;

type SummaryRow = RowDataPacket & {
  id: string;
  heading: string;
  body: string;
  village_name: string;
  district: string;
  regency: string;
  province: string;
  highlight_label: string;
  highlight_value: string;
};

const fallbackProfileSummary: HomepageProfileSummary = {
  id: "70a7abf2-51df-4d6b-9966-0a6d3ec5120b",
  heading: "Desa yang tumbuh dari gotong royong, pangan, dan tradisi.",
  body:
    "Desa Keseneng dikenal sebagai desa dengan kekuatan gotong royong, lahan pertanian produktif, dan kekayaan seni budaya yang terus dirawat oleh masyarakat. Website ini menyajikan informasi desa secara terbuka agar warga, wisatawan, dan mitra dapat memahami potensi Keseneng dengan lebih mudah.",
  location: {
    village: "Desa Keseneng",
    district: "Mojotengah",
    regency: "Wonosobo",
    province: "Jawa Tengah",
  },
  highlight: {
    label: "Fokus unggulan",
    value: "Pertanian dan kesenian",
  },
  cta: {
    label: "Selengkapnya",
    href: "/profil",
  },
};

export async function getHomepageProfileSummary() {
  const rows = await queryRows<SummaryRow>(
    `SELECT id, heading, body, village_name, district, regency, province, highlight_label, highlight_value
     FROM homepage_profile_summaries
     WHERE is_active = TRUE
     ORDER BY display_order ASC
     LIMIT 1`,
  );

  return rows[0] ? mapSummaryRow(rows[0]) : fallbackProfileSummary;
}

export async function updateHomepageProfileSummary(input: Partial<HomepageProfileSummaryInput>) {
  const current = await getHomepageProfileSummary();
  const nextSummary: HomepageProfileSummary = {
    ...current,
    ...input,
    location: input.location ?? current.location,
    highlight: input.highlight ?? current.highlight,
    cta: input.cta ?? current.cta,
  };

  if (!isHomepageProfileSummary(nextSummary)) {
    return null;
  }

  await executeSql(
    `INSERT INTO homepage_profile_summaries
     (id, heading, body, village_name, district, regency, province, highlight_label, highlight_value, is_active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 1)
     ON DUPLICATE KEY UPDATE
       heading = VALUES(heading), body = VALUES(body), village_name = VALUES(village_name),
       district = VALUES(district), regency = VALUES(regency), province = VALUES(province),
       highlight_label = VALUES(highlight_label), highlight_value = VALUES(highlight_value),
       is_active = TRUE, display_order = 1`,
    [
      current.id,
      nextSummary.heading,
      nextSummary.body,
      nextSummary.location.village,
      nextSummary.location.district,
      nextSummary.location.regency,
      nextSummary.location.province,
      nextSummary.highlight.label,
      nextSummary.highlight.value,
    ],
  );

  return getHomepageProfileSummary();
}

export async function resetHomepageProfileSummary() {
  await executeSql("DELETE FROM homepage_profile_summaries");
  await updateHomepageProfileSummary(fallbackProfileSummary);

  return getHomepageProfileSummary();
}

export function isHomepageProfileSummary(value: unknown): value is HomepageProfileSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageProfileSummary>;

  return (
    typeof candidate.heading === "string" &&
    candidate.heading.trim().length > 0 &&
    typeof candidate.body === "string" &&
    candidate.body.trim().length > 0 &&
    isLocation(candidate.location) &&
    isLabelValue(candidate.highlight) &&
    isCta(candidate.cta)
  );
}

function mapSummaryRow(row: SummaryRow): HomepageProfileSummary {
  return {
    id: row.id,
    heading: row.heading,
    body: row.body,
    location: {
      village: row.village_name,
      district: row.district,
      regency: row.regency,
      province: row.province,
    },
    highlight: {
      label: row.highlight_label,
      value: row.highlight_value,
    },
    cta: fallbackProfileSummary.cta,
  };
}

function isLocation(value: unknown): value is HomepageProfileSummary["location"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageProfileSummary["location"]>;

  return [candidate.village, candidate.district, candidate.regency, candidate.province].every(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
}

function isLabelValue(value: unknown): value is HomepageProfileSummary["highlight"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageProfileSummary["highlight"]>;

  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.value === "string" &&
    candidate.value.trim().length > 0
  );
}

function isCta(value: unknown): value is HomepageProfileSummary["cta"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageProfileSummary["cta"]>;

  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.href === "string" &&
    candidate.href.trim().length > 0
  );
}
