"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicNewsItem } from "@/lib/public-news";

type NewsDetailPageProps = {
  initialNews: PublicNewsItem;
  relatedNews: PublicNewsItem[];
};

type NewsDetailApiResponse = {
  data: PublicNewsItem;
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
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85",
  },
  Kesenian: {
    accent: "bg-amber-100 text-amber-800",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=85",
  },
  "Informasi Publik": {
    accent: "bg-sky-100 text-sky-800",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
  },
  Kesehatan: {
    accent: "bg-rose-100 text-rose-800",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=85",
  },
  Pembangunan: {
    accent: "bg-orange-100 text-orange-800",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=85",
  },
  UMKM: {
    accent: "bg-emerald-100 text-emerald-800",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1600&q=85",
  },
  Pemerintahan: {
    accent: "bg-indigo-100 text-indigo-800",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=85",
  },
  Pengumuman: {
    accent: "bg-lime-100 text-lime-800",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85",
  },
};

export function NewsDetailPage({
  initialNews,
  relatedNews,
}: NewsDetailPageProps) {
  const [news, setNews] = useState(initialNews);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNewsDetail() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/news/${initialNews.slug}`);

        if (!response.ok) {
          throw new Error("Gagal memuat detail berita");
        }

        const payload = (await response.json()) as NewsDetailApiResponse;

        if (isMounted) {
          setNews(payload.data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Detail berita belum dapat dimuat ulang.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNewsDetail();

    return () => {
      isMounted = false;
    };
  }, [initialNews.slug]);

  const visual = getCategoryVisual(news);

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${news.imageUrl || visual.image})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.8)_54%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto max-w-7xl">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-slate-200"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/berita" className="transition-colors hover:text-white">
              Berita
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Detail</span>
          </nav>
          <div className="mt-8 max-w-4xl">
            <span
              className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${visual.accent}`}
            >
              {news.category}
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {news.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
              <time>{formatDate(news.publishedAt)}</time>
              <span aria-hidden="true">/</span>
              <span>{news.authorName}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-20">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="section-kicker">Berita Desa</p>
            {isLoading ? (
              <span className="rounded-md bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800">
                Memuat detail...
              </span>
            ) : null}
          </div>
          {errorMessage ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}
          <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
            {news.content.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {news.galleryImages.length > 0 ? (
            <section className="mt-10 border-t border-slate-200 pt-8">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="section-kicker">Galeri Foto</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Dokumentasi kegiatan
                  </h2>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {news.galleryImages.length} foto
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {news.galleryImages.map((image) => (
                  <figure
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-stone-50"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={900}
                      height={675}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {image.caption ? (
                      <figcaption className="px-4 py-3 text-sm leading-6 text-slate-600">
                        {image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <Link
            href="/berita"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
          >
            Kembali ke Daftar Berita
          </Link>
        </article>

        <aside className="grid gap-4 self-start lg:sticky lg:top-28">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Ringkasan
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="rounded-md bg-stone-50 p-3">
                <dt className="font-semibold text-slate-950">Kategori</dt>
                <dd className="mt-1 text-slate-600">{news.category}</dd>
              </div>
              <div className="rounded-md bg-stone-50 p-3">
                <dt className="font-semibold text-slate-950">Tanggal</dt>
                <dd className="mt-1 text-slate-600">
                  {formatDate(news.publishedAt)}
                </dd>
              </div>
              <div className="rounded-md bg-stone-50 p-3">
                <dt className="font-semibold text-slate-950">Penulis</dt>
                <dd className="mt-1 text-slate-600">{news.authorName}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Berita Lainnya
            </p>
            <div className="mt-4 grid gap-3">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="rounded-md bg-stone-50 p-3 transition-colors hover:bg-sage-50"
                >
                  <span className="text-xs font-semibold text-sage-800">
                    {item.category}
                  </span>
                  <strong className="mt-2 block text-sm leading-6 text-slate-950">
                    {item.title}
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
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






