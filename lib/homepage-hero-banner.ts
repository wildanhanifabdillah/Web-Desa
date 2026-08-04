import type { RowDataPacket } from "mysql2";
import { executeSql, queryRows } from "@/lib/db";

export type HomepageHeroBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  } | null;
};

export type HomepageHeroBannerInput = Omit<HomepageHeroBanner, "id">;

type HeroRow = RowDataPacket & {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image_url: string;
  image_alt: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
};

const fallbackHeroBanner: HomepageHeroBanner = {
  id: "8f6b54a1-7d8f-4e50-9d8f-6b0d3c2a7a10",
  eyebrow: "Pemerintah Desa Keseneng",
  title: "Desa Terbuka, Mandiri, dan Berkelanjutan Berbasis Teknologi Digital.",
  subtitle:
    "Jelajahi profil desa, potensi pertanian, kesenian warga, berita terbaru, statistik, dan dokumen publik dalam satu pengalaman yang rapi dan mudah diakses.",
  imageUrl: "/hero-section.webp",
  imageAlt: "Lanskap Desa Keseneng sebagai latar halaman utama",
  primaryCta: {
    label: "Jelajahi Potensi",
    href: "/potensi",
  },
  secondaryCta: {
    label: "Lihat Transparansi",
    href: "/#transparansi",
  },
};

export async function getActiveHomepageHeroBanner() {
  const rows = await queryRows<HeroRow>(
    `SELECT id, eyebrow, title, subtitle, image_url, image_alt, primary_cta_label,
            primary_cta_href, secondary_cta_label, secondary_cta_href
     FROM homepage_hero_banners
     WHERE is_active = TRUE
     ORDER BY display_order ASC
     LIMIT 1`,
  );

  return rows[0] ? mapHeroRow(rows[0]) : fallbackHeroBanner;
}

export async function updateHomepageHeroBanner(input: Partial<HomepageHeroBannerInput>) {
  const current = await getActiveHomepageHeroBanner();
  const nextHero: HomepageHeroBanner = {
    ...current,
    ...input,
    primaryCta: input.primaryCta ?? current.primaryCta,
    secondaryCta: input.secondaryCta === undefined ? current.secondaryCta : input.secondaryCta,
  };

  if (!isHomepageHeroBanner(nextHero)) {
    return null;
  }

  await executeSql(
    `INSERT INTO homepage_hero_banners
     (id, eyebrow, title, subtitle, image_url, image_alt, primary_cta_label, primary_cta_href,
      secondary_cta_label, secondary_cta_href, is_active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 1)
     ON DUPLICATE KEY UPDATE
       eyebrow = VALUES(eyebrow), title = VALUES(title), subtitle = VALUES(subtitle),
       image_url = VALUES(image_url), image_alt = VALUES(image_alt),
       primary_cta_label = VALUES(primary_cta_label), primary_cta_href = VALUES(primary_cta_href),
       secondary_cta_label = VALUES(secondary_cta_label), secondary_cta_href = VALUES(secondary_cta_href),
       is_active = TRUE, display_order = 1`,
    [
      current.id,
      nextHero.eyebrow,
      nextHero.title,
      nextHero.subtitle,
      nextHero.imageUrl,
      nextHero.imageAlt,
      nextHero.primaryCta.label,
      nextHero.primaryCta.href,
      nextHero.secondaryCta?.label ?? null,
      nextHero.secondaryCta?.href ?? null,
    ],
  );

  return getActiveHomepageHeroBanner();
}

export async function resetHomepageHeroBanner() {
  await executeSql("DELETE FROM homepage_hero_banners");
  await updateHomepageHeroBanner(fallbackHeroBanner);

  return getActiveHomepageHeroBanner();
}

export function isHomepageHeroBanner(value: unknown): value is HomepageHeroBanner {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageHeroBanner>;

  return (
    typeof candidate.eyebrow === "string" &&
    candidate.eyebrow.trim().length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.subtitle === "string" &&
    candidate.subtitle.trim().length > 0 &&
    typeof candidate.imageUrl === "string" &&
    candidate.imageUrl.trim().length > 0 &&
    typeof candidate.imageAlt === "string" &&
    candidate.imageAlt.trim().length > 0 &&
    isCta(candidate.primaryCta) &&
    (candidate.secondaryCta === null || isCta(candidate.secondaryCta))
  );
}

function mapHeroRow(row: HeroRow): HomepageHeroBanner {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    primaryCta: {
      label: row.primary_cta_label,
      href: row.primary_cta_href,
    },
    secondaryCta: row.secondary_cta_label && row.secondary_cta_href ? {
      label: row.secondary_cta_label,
      href: row.secondary_cta_href,
    } : null,
  };
}

function isCta(value: unknown): value is HomepageHeroBanner["primaryCta"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HomepageHeroBanner["primaryCta"]>;

  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.href === "string" &&
    candidate.href.trim().length > 0
  );
}
