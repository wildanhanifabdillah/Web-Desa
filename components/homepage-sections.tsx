import Link from "next/link";
import { fetchPublicApi, type ApiResponse } from "@/lib/public-api";
import type { PotentialCategory } from "@/lib/potential-categories";
import type { PublicNewsItem } from "@/lib/public-news";
import type { HomepageHeroBanner } from "@/lib/homepage-hero-banner";
import type { HomepageProfileSummary } from "@/lib/homepage-profile-summary";

export async function HomepageHero() {
  const { data: hero } = await fetchPublicApi<ApiResponse<HomepageHeroBanner>>("/api/homepage/hero-banner");

  return (
    <section id="beranda" className="relative isolate min-h-[92vh] overflow-hidden bg-slate-950 px-4 pt-32 text-center text-white sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.imageUrl})` }}
        aria-label={hero.imageAlt}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62)_48%,rgba(15,23,42,0.84))]" />
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center pb-16 pt-16 lg:min-h-[calc(92vh-8rem)]">
        <p className="mb-5 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
          {hero.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
          {hero.subtitle}
        </p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sage-50"
          >
            {hero.primaryCta.label}
          </Link>
          {hero.secondaryCta ? (
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              {hero.secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export async function ProfileSummarySection() {
  const { data: summary } = await fetchPublicApi<ApiResponse<HomepageProfileSummary>>("/api/homepage/profile-summary");

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
      <div>
        <p className="section-kicker">Ringkasan Profil</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          {summary.heading}
        </h2>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-base leading-8 text-slate-600">
          {summary.body}
        </p>
        <dl className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-950">Kecamatan</dt>
            <dd>{summary.location.district}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-950">Kabupaten</dt>
            <dd>{summary.location.regency}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-950">{summary.highlight.label}</dt>
            <dd>{summary.highlight.value}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-950">Provinsi</dt>
            <dd>{summary.location.province}</dd>
          </div>
        </dl>
        <Link
          href={summary.cta.href}
          className="mt-6 inline-flex h-11 items-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
        >
          {summary.cta.label}
        </Link>
      </div>
    </section>
  );
}

type HomepageStatisticMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  featured?: boolean;
};

type StatisticsApiData = {
  overview: HomepageStatisticMetric[];
};

export async function StatisticsSection() {
  const { data } = await fetchPublicApi<ApiResponse<StatisticsApiData>>("/api/statistics");
  const stats = data.overview
    .filter((item) => item.featured ?? true)
    .slice(0, 4);

  const accentClasses = [
    "bg-sage-100 text-sage-800",
    "bg-amber-100 text-amber-800",
    "bg-emerald-100 text-emerald-800",
    "bg-sky-100 text-sky-800",
  ];

  return (
    <section id="statistik" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="section-kicker">Statistik Singkat</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Angka penting Desa Keseneng dalam satu pandangan.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <article
              key={item.label}
              className="rounded-lg border border-slate-200 bg-stone-50 p-5"
            >
              <span
                className={`inline-flex h-9 items-center rounded-md px-3 text-xs font-semibold ${accentClasses[index % accentClasses.length]}`}
              >
                {item.label}
              </span>
              <strong className="mt-6 block text-4xl font-semibold text-slate-950">
                {formatStatisticValue(item.value)}
              </strong>
              <span className="mt-1 block text-sm text-slate-600">{item.unit}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function PotentialSection() {
  const { data: categories } = await fetchPublicApi<ApiResponse<PotentialCategory[]>>("/api/potentials/categories");
  const potentials = categories.slice(0, 3).map((category) => ({
    label: category.label,
    title: category.title,
    description: category.summary,
    image: category.image,
  }));

  return (
    <section id="potensi" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="section-kicker">Potensi Desa</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Unggulan yang siap diperkenalkan lebih luas.
          </h2>
        </div>
        <Link
          href="/potensi"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
        >
          Semua Potensi
        </Link>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {potentials.map((item) => (
          <article
            key={item.title}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
              aria-hidden="true"
            />
            <div className="p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">
                {item.label}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function LatestNewsSection() {
  const { data: news } = await fetchPublicApi<ApiResponse<PublicNewsItem[]>>("/api/homepage/latest-news");
  const latestPublicNews = news.slice(0, 3);

  return (
    <section id="berita" className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker text-sage-200">Berita Terbaru</p>
            <h2 className="mt-3 text-3xl font-semibold">
              Kabar kegiatan dan pengumuman Desa Keseneng.
            </h2>
          </div>
          <Link
            href="/berita"
            className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sage-50"
          >
            Semua Berita
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {latestPublicNews.map((item) => (
            <Link
              key={item.id}
              href={`/berita/${item.slug}`}
              className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur-md transition-colors hover:border-sage-200 hover:bg-white/15"
            >
              <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
                <span className="rounded-md bg-sage-700 px-2 py-1 font-semibold text-white">
                  {item.category}
                </span>
                <time>{formatShortDate(item.publishedAt)}</time>
              </div>
              <h3 className="mt-5 text-xl font-semibold leading-7">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransparencyCallout() {
  return (
    <section id="transparansi" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div id="dokumen" className="grid gap-6 rounded-lg bg-sage-800 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-100">
            Transparansi Desa
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Dokumen publik disiapkan agar warga mudah memantau informasi desa.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-sage-50">
            Akses laporan, realisasi anggaran, dan dokumen resmi desa melalui
            direktori digital yang akan terus diperbarui.
          </p>
        </div>
        <Link
          href="/#dokumen"
          className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-sage-800 transition-colors hover:bg-sage-50"
        >
          Buka Dokumen
        </Link>
      </div>
    </section>
  );
}


function formatStatisticValue(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}



