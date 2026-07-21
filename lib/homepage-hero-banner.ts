import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

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

let heroBanner = loadJsonFile("homepage-hero-banner.json", fallbackHeroBanner);

export async function getActiveHomepageHeroBanner() {
  return heroBanner;
}

export function updateHomepageHeroBanner(input: Partial<HomepageHeroBannerInput>) {
  const nextHero: HomepageHeroBanner = {
    ...heroBanner,
    ...input,
    primaryCta: input.primaryCta ?? heroBanner.primaryCta,
    secondaryCta: input.secondaryCta === undefined ? heroBanner.secondaryCta : input.secondaryCta,
  };

  if (!isHomepageHeroBanner(nextHero)) {
    return null;
  }

  heroBanner = nextHero;
  saveJsonFile("homepage-hero-banner.json", heroBanner);

  return heroBanner;
}

export function resetHomepageHeroBanner() {
  heroBanner = resetJsonFile("homepage-hero-banner.json", fallbackHeroBanner);

  return heroBanner;
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
