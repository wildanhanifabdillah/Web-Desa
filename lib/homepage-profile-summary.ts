import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

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

let profileSummary = loadJsonFile("homepage-profile-summary.json", fallbackProfileSummary);

export async function getHomepageProfileSummary() {
  return profileSummary;
}

export function updateHomepageProfileSummary(input: Partial<HomepageProfileSummaryInput>) {
  const nextSummary: HomepageProfileSummary = {
    ...profileSummary,
    ...input,
    location: input.location ?? profileSummary.location,
    highlight: input.highlight ?? profileSummary.highlight,
    cta: input.cta ?? profileSummary.cta,
  };

  if (!isHomepageProfileSummary(nextSummary)) {
    return null;
  }

  profileSummary = nextSummary;
  saveJsonFile("homepage-profile-summary.json", profileSummary);

  return profileSummary;
}

export function resetHomepageProfileSummary() {
  profileSummary = resetJsonFile("homepage-profile-summary.json", fallbackProfileSummary);

  return profileSummary;
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
