"use client";

import { useState } from "react";
import Link from "next/link";
import type { TransparencyDocument } from "@/lib/transparency";

type TransparencyPageProps = {
  documents: TransparencyDocument[];
};

const allCategoriesLabel = "Semua";

export function TransparencyPage({ documents }: TransparencyPageProps) {
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const categories = Array.from(new Set(documents.map((item) => item.category)));
  const categoryOptions = [allCategoriesLabel, ...categories];
  const visibleDocuments =
    activeCategory === allCategoriesLabel
      ? documents
      : documents.filter((item) => item.category === activeCategory);
  const latestYear = Math.max(...documents.map((item) => item.year));


  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.8)_52%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.5fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Transparansi Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Dokumen publik desa dalam satu daftar yang mudah dipindai.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Warga dapat melihat daftar dokumen anggaran, perencanaan,
              realisasi, dan informasi publik sebagai bagian dari keterbukaan
              pengelolaan desa.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={documents.length.toString()} label="dokumen" />
            <HeroMetric value={categories.length.toString()} label="kategori" />
            <HeroMetric value={latestYear.toString()} label="tahun terbaru" />
            <HeroMetric value="Publik" label="status" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">Daftar Dokumen</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Dokumen dikelompokkan menurut jenis informasi publik desa.
            </h2>
          </div>
          <div className="w-full max-w-xl">
            <div className="hidden flex-wrap justify-end gap-2 md:flex">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    category === activeCategory
                      ? "bg-slate-950 text-white"
                      : "bg-sage-100 text-sage-800 hover:bg-sage-200"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="block md:hidden">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Jenis laporan
              </span>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-100"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {visibleDocuments.length} dokumen ditampilkan
          </span>
          <span>
            Filter: {activeCategory}
          </span>
        </div>

        {visibleDocuments.length > 0 ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {visibleDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-950">
              Dokumen tidak ditemukan
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pilih jenis laporan lain untuk melihat dokumen transparansi.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function DocumentCard({
  document,
}: {
  document: TransparencyDocument;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sage-700 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
            {document.category}
          </span>
          <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-950">
            {document.title}
          </h3>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 text-center text-white">
          <strong className="block text-sm">{document.fileType}</strong>
          <span className="text-[11px] text-slate-300">{document.fileSize}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {document.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
        <div className="text-slate-500">
          <span>{document.year}</span>
          <span aria-hidden="true"> / </span>
          <time>{formatDate(document.publishedAt)}</time>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={`/transparansi/${document.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
          >
            Lihat Dokumen
          </Link>
          <Link
            href={`/api/transparency/${document.slug}/download`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
          >
            Unduh Dokumen
          </Link>
        </div>
      </div>
    </article>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
