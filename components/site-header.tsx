"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";

const fallbackSettings: Pick<SiteSettings, "brand" | "header"> = {
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
};

const fallbackPotentialItems = [
  { label: "Semua Potensi", href: "/potensi" },
  { label: "Pertanian", href: "/potensi/pertanian" },
  { label: "Kesenian", href: "/potensi/kesenian" },
  { label: "Peternakan", href: "/potensi/peternakan" },
  { label: "UMKM", href: "/potensi/umkm" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(fallbackSettings);
  const [potentialItems, setPotentialItems] = useState(fallbackPotentialItems);

  useEffect(() => {
    const updateHeaderState = () => setIsScrolled(window.scrollY > 24);

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSiteSettings() {
      const response = await fetch("/api/site-settings", { signal: controller.signal });

      if (!response.ok) {
        return;
      }

      const payload = await response.json() as { data?: SiteSettings };

      if (payload.data) {
        setSiteSettings({ brand: payload.data.brand, header: payload.data.header });
      }
    }

    loadSiteSettings().catch(() => undefined);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPotentialCategories() {
      const response = await fetch("/api/potentials/categories", {
        signal: controller.signal,
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json() as {
        data?: Array<{ label: string; slug: string }>;
      };
      const categories = payload.data ?? [];

      if (categories.length > 0) {
        setPotentialItems([
          fallbackPotentialItems[0],
          ...categories.map((category) => ({
            label: category.label,
            href: `/potensi/${category.slug}`,
          })),
        ]);
      }
    }

    loadPotentialCategories().catch(() => undefined);

    return () => controller.abort();
  }, []);

  const navigationItems = siteSettings.header.navigation;
  const beforePotential = navigationItems.slice(0, 2);
  const afterPotential = navigationItems.slice(2);
  const headerClassName = isScrolled
    ? "border-slate-200/80 bg-white/90 text-slate-900 shadow-sm backdrop-blur-xl"
    : "border-white/10 bg-transparent text-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${headerClassName}`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={siteSettings.brand.ariaLabel}>
          <span className="flex h-18 w-18 items-center justify-center">
            <Image
              src={siteSettings.brand.logoUrl}
              alt={siteSettings.brand.logoAlt}
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">
              {siteSettings.brand.eyebrow}
            </span>
            <span className="text-lg font-semibold">{siteSettings.brand.name}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {beforePotential.map((item) => (
            <HeaderLink key={item.label} href={item.href} isScrolled={isScrolled}>
              {item.label}
            </HeaderLink>
          ))}

          <div className="group relative">
            <button
              type="button"
              className={`flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors ${
                isScrolled
                  ? "text-slate-700 hover:bg-sage-50 hover:text-sage-800"
                  : "text-white/88 hover:bg-white/10 hover:text-white"
              }`}
            >
              Potensi
              <span aria-hidden="true" className="text-xs">
                v
              </span>
            </button>
            <div className="invisible absolute left-0 top-full w-56 translate-y-3 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
              {potentialItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sage-50 hover:text-sage-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {afterPotential.map((item) => (
            <HeaderLink key={item.label} href={item.href} isScrolled={isScrolled}>
              {item.label}
            </HeaderLink>
          ))}
        </nav>

        <Link
          href={siteSettings.header.adminHref}
          className={`hidden h-10 items-center rounded-md px-4 text-sm font-semibold transition-colors lg:flex ${
            isScrolled
              ? "bg-sage-700 text-white hover:bg-sage-800"
              : "bg-white text-slate-950 hover:bg-sage-50"
          }`}
        >
          {siteSettings.header.adminLabel}
        </Link>

        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center rounded-md border text-sm font-semibold transition-colors lg:hidden ${
            isScrolled
              ? "border-slate-200 bg-white text-slate-900"
              : "border-white/30 bg-white/10 text-white backdrop-blur-md"
          }`}
          aria-label="Buka menu navigasi"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="flex h-5 w-5 flex-col justify-center gap-1.5" aria-hidden="true">
            <span className={`h-0.5 rounded-full bg-current transition-transform ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 rounded-full bg-current transition-opacity ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`h-0.5 rounded-full bg-current transition-transform ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-lg lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Navigasi mobile">
            {beforePotential.map((item) => (
              <MobileLink key={item.label} href={item.href}>{item.label}</MobileLink>
            ))}
            <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Potensi
            </div>
            {potentialItems.map((item) => (
              <MobileLink key={item.label} href={item.href}>{item.label}</MobileLink>
            ))}
            {afterPotential.map((item) => (
              <MobileLink key={item.label} href={item.href}>{item.label}</MobileLink>
            ))}
            <MobileLink href={siteSettings.header.adminHref}>{siteSettings.header.adminLabel}</MobileLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeaderLink({
  href,
  isScrolled,
  children,
}: {
  href: string;
  isScrolled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${
        isScrolled
          ? "text-slate-700 hover:bg-sage-50 hover:text-sage-800"
          : "text-white/88 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sage-50 hover:text-sage-800"
    >
      {children}
    </Link>
  );
}

