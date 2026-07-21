import { loadJsonFile, resetJsonFile, saveJsonFile } from "@/lib/json-file-store";

export type SiteLink = {
  label: string;
  href: string;
};

export type SiteContactInfo = {
  label: string;
  value: string;
};

export type SiteSocialLink = SiteLink & {
  icon: "facebook" | "instagram" | "youtube" | "whatsapp" | string;
};

export type SiteSettings = {
  id: string;
  brand: {
    eyebrow: string;
    name: string;
    logoUrl: string;
    logoAlt: string;
    ariaLabel: string;
  };
  header: {
    navigation: SiteLink[];
    adminLabel: string;
    adminHref: string;
  };
  footer: {
    eyebrow: string;
    tagline: string;
    description: string;
    cta: SiteLink;
    quickLinks: SiteLink[];
    publicLinks: SiteLink[];
    contacts: SiteContactInfo[];
    serviceHoursTitle: string;
    serviceHours: string;
    copyright: string;
    credit: string;
  };
  socialLinks: SiteSocialLink[];
  updatedAt: string;
};

export type SiteSettingsInput = Omit<SiteSettings, "id" | "updatedAt">;

const fallbackSiteSettings: SiteSettings = {
  id: "site-settings",
  brand: {
    eyebrow: "Desa",
    name: "Keseneng",
    logoUrl: "/logo-wonosobo.png",
    logoAlt: "Logo Kabupaten Wonosobo",
    ariaLabel: "Desa Keseneng",
  },
  header: {
    navigation: [
      { label: "Beranda", href: "/" },
      { label: "Profil", href: "/profil" },
      { label: "Berita", href: "/berita" },
      { label: "Galeri", href: "/galeri" },
      { label: "Statistik", href: "/statistik" },
      { label: "Transparansi", href: "/transparansi" },
      { label: "Dokumen", href: "/dokumen" },
    ],
    adminLabel: "Admin",
    adminHref: "/admin/",
  },
  footer: {
    eyebrow: "Pemerintah Desa Keseneng",
    tagline: "Portal informasi publik, potensi desa, berita, dan dokumen resmi.",
    description:
      "Website profil Desa Keseneng sebagai kanal layanan informasi, publikasi kegiatan, arsip dokumen, dan keterbukaan pemerintahan desa.",
    cta: { label: "Lihat Transparansi", href: "/transparansi" },
    quickLinks: [
      { label: "Beranda", href: "/" },
      { label: "Profil Desa", href: "/profil" },
      { label: "Potensi", href: "/potensi" },
      { label: "Berita", href: "/berita" },
      { label: "Statistik", href: "/statistik" },
      { label: "Galeri", href: "/galeri" },
    ],
    publicLinks: [
      { label: "Transparansi", href: "/transparansi" },
      { label: "Dokumen/Perdes", href: "/dokumen" },
    ],
    contacts: [
      { label: "Alamat", value: "RT 004 RW 001, Jalan Lingkar Utara, Desa Keseneng" },
      { label: "Wilayah", value: "Kec. Mojotengah, Kab. Wonosobo" },
      { label: "Telepon", value: "082220556585" },
      { label: "Email", value: "keseneng.mojotengah@gmail.com" },
    ],
    serviceHoursTitle: "Jam layanan",
    serviceHours: "Senin - Jumat, 08.00 - 13.00 WIB",
    copyright: "Pemerintah Desa Keseneng. Semua hak dilindungi.",
    credit: "Credit: Pemerintah Desa Keseneng bersama Tim KKN-PPM UGM Arunika Kawula 2026.",
  },
  socialLinks: [
    { label: "Facebook", href: "https://facebook.com/desakeseneng", icon: "facebook" },
    { label: "Instagram", href: "https://www.instagram.com/keseneng_zone/", icon: "instagram" },
    { label: "YouTube", href: "https://youtube.com/@desakeseneng", icon: "youtube" },
    { label: "WhatsApp", href: "https://wa.me/6280000000000", icon: "whatsapp" },
  ],
  updatedAt: "2026-07-16T00:00:00.000Z",
};

let siteSettings = loadJsonFile("site-settings.json", fallbackSiteSettings);

export function getSiteSettings() {
  return siteSettings;
}

export function updateSiteSettings(input: Partial<SiteSettingsInput>) {
  const updated: SiteSettings = {
    ...siteSettings,
    ...input,
    brand: input.brand ?? siteSettings.brand,
    header: input.header ?? siteSettings.header,
    footer: input.footer ?? siteSettings.footer,
    socialLinks: input.socialLinks ?? siteSettings.socialLinks,
    updatedAt: new Date().toISOString(),
  };

  if (!isSiteSettings(updated)) {
    return null;
  }

  siteSettings = updated;
  saveJsonFile("site-settings.json", siteSettings);

  return siteSettings;
}

export function resetSiteSettings() {
  siteSettings = resetJsonFile("site-settings.json", fallbackSiteSettings);

  return siteSettings;
}

export function isSiteSettings(value: unknown): value is SiteSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SiteSettings>;

  return (
    !!candidate.brand &&
    hasText(candidate.brand.eyebrow) &&
    hasText(candidate.brand.name) &&
    hasText(candidate.brand.logoUrl) &&
    hasText(candidate.brand.logoAlt) &&
    hasText(candidate.brand.ariaLabel) &&
    !!candidate.header &&
    Array.isArray(candidate.header.navigation) &&
    candidate.header.navigation.every(isSiteLink) &&
    hasText(candidate.header.adminLabel) &&
    hasText(candidate.header.adminHref) &&
    !!candidate.footer &&
    hasText(candidate.footer.eyebrow) &&
    hasText(candidate.footer.tagline) &&
    hasText(candidate.footer.description) &&
    isSiteLink(candidate.footer.cta) &&
    Array.isArray(candidate.footer.quickLinks) &&
    candidate.footer.quickLinks.every(isSiteLink) &&
    Array.isArray(candidate.footer.publicLinks) &&
    candidate.footer.publicLinks.every(isSiteLink) &&
    Array.isArray(candidate.footer.contacts) &&
    candidate.footer.contacts.every(isContactInfo) &&
    hasText(candidate.footer.serviceHoursTitle) &&
    hasText(candidate.footer.serviceHours) &&
    hasText(candidate.footer.copyright) &&
    hasText(candidate.footer.credit) &&
    Array.isArray(candidate.socialLinks) &&
    candidate.socialLinks.every(isSocialLink)
  );
}

function isSiteLink(value: unknown): value is SiteLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SiteLink>;

  return hasText(candidate.label) && hasText(candidate.href);
}

function isContactInfo(value: unknown): value is SiteContactInfo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SiteContactInfo>;

  return hasText(candidate.label) && hasText(candidate.value);
}

function isSocialLink(value: unknown): value is SiteSocialLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SiteSocialLink>;

  return hasText(candidate.label) && hasText(candidate.href) && hasText(candidate.icon);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
