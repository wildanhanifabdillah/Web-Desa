"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PublicNewsItem } from "@/lib/public-news";

type NewsPageProps = {
  initialNews: PublicNewsItem[];
};

type NewsApiResponse = {
  data: PublicNewsItem[];
};

const categoryStyles: Record<
  string,
  {
    accent: string;
    image: string;
  }
> = {
  Pertanian: {
    accent: "bg-sage-100 text-sage-800",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
  },
  Kesenian: {
    accent: "bg-amber-100 text-amber-800",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80",
  },
  "Informasi Publik": {
    accent: "bg-sky-100 text-sky-800",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  Kesehatan: {
    accent: "bg-rose-100 text-rose-800",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
  },
  Pembangunan: {
    accent: "bg-orange-100 text-orange-800",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  },
  UMKM: {
    accent: "bg-emerald-100 text-emerald-800",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
  },
  Pemerintahan: {
    accent: "bg-indigo-100 text-indigo-800",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  },
  Pengumuman: {
    accent: "bg-lime-100 text-lime-800",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  },
};

export function NewsPage({ initialNews }: NewsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newsItems, setNewsItems] = useState(initialNews);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const endpoint = normalizedQuery
          ? `/api/news?q=${encodeURIComponent(normalizedQuery)}`
          : "/api/news";
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Gagal memuat berita");
        }

        const payload = (await response.json()) as NewsApiResponse;

        if (isMounted) {
          setNewsItems(payload.data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Berita belum dapat dimuat. Coba lagi nanti.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, [normalizedQuery]);

  const featuredNews = initialNews[0];
  const categories = Array.from(
    new Set(initialNews.map((item) => item.category)),
  );
  const visibleNews = useMemo(() => {
    if (!normalizedQuery) {
      return newsItems.slice(1);
    }

    return newsItems;
  }, [newsItems, normalizedQuery]);

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78)_48%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.5fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Berita Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Kabar kegiatan, pengumuman, dan informasi terbaru Desa Keseneng.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Halaman berita menyajikan arsip publikasi desa agar warga dapat
              mengikuti agenda, kegiatan, dan informasi layanan dalam satu
              tempat.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={initialNews.length.toString()} label="berita" />
            <HeroMetric value={categories.length.toString()} label="kategori" />
            <HeroMetric value="2026" label="periode" />
            <HeroMetric value="Publik" label="status" />
          </div>
        </div>
      </section>

      {featuredNews ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.85fr)] lg:items-center">
            <Link
              href={`/berita/${featuredNews.slug}`}
              className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-sage-700"
              aria-label={`Baca detail ${featuredNews.title}`}
            >
              <div
                className="aspect-[16/10] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02] lg:aspect-[4/3]"
                style={{
                  backgroundImage: `url(${featuredNews.imageUrl})`,
                }}
                aria-hidden="true"
              />
            </Link>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:p-8">
              <span
                className={`inline-flex w-fit rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                  getCategoryVisual(featuredNews).accent
                }`}
              >
                {featuredNews.category}
              </span>
              <h2 className="mt-5 text-2xl font-semibold leading-tight sm:text-3xl">
                {featuredNews.title}
              </h2>
              <p className="mt-4 line-clamp-5 text-base leading-8 text-slate-600">
                {featuredNews.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{formatDate(featuredNews.publishedAt)}</span>
                <span aria-hidden="true">/</span>
                <span>{featuredNews.authorName}</span>
              </div>
              <Link
                href={`/berita/${featuredNews.slug}`}
                className="mt-7 inline-flex h-11 w-fit items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
              >
                Baca Selengkapnya
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="section-kicker">Daftar Berita</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Publikasi desa dikelompokkan berdasarkan kategori informasi.
              </h2>
            </div>
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-stone-50 p-4 shadow-sm">
              <label
                htmlFor="news-search"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Cari Berita
              </label>
              <input
                id="news-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Judul, kategori, atau kata kunci"
                className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-sage-700 focus:ring-2 focus:ring-sage-100"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className={`rounded-md px-3 py-2 text-xs font-semibold ${
                    categoryStyles[category]?.accent ?? "bg-stone-100 text-slate-700"
                  }`}
                >
                  {category}
                </span>
              ))}
            </div>
            <span className="text-sm font-medium text-slate-500">
              {isLoading ? "Memuat berita..." : `${visibleNews.length} berita ditampilkan`}
            </span>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {visibleNews.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-stone-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-950">
                Berita tidak ditemukan
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Coba gunakan kata kunci lain untuk melihat publikasi desa.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function NewsCard({ item }: { item: PublicNewsItem }) {
  const visual = getCategoryVisual(item);

  return (
    <Link
      href={`/berita/${item.slug}`}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-sage-700"
      aria-label={`Baca detail ${item.title}`}
    >
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl || visual.image})` }}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${visual.accent}`}
          >
            {item.category}
          </span>
          <time className="text-xs text-slate-500">
            {formatDate(item.publishedAt)}
          </time>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
          {item.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.excerpt}</p>
        <div className="mt-5 text-xs font-semibold text-sage-800">
          Baca Selengkapnya
        </div>
      </div>
    </Link>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4">
      <strong className="block text-2xl font-semibold">{value}</strong>
      <span className="mt-1 block text-sm text-slate-200">{label}</span>
    </div>
  );
}

function getCategoryVisual(item: PublicNewsItem) {
  return (
    categoryStyles[item.category] ?? {
      accent: "bg-stone-100 text-slate-700",
      image: item.imageUrl,
    }
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}





