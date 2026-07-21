"use client";

import { useState } from "react";

import type { VillageRegulation } from "@/lib/village-regulations";

type DocumentsPageProps = {
  regulations: VillageRegulation[];
};

export function DocumentsPage({ regulations }: DocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const categories = Array.from(new Set(regulations.map((item) => item.category)));
  const activeCount = regulations.filter((item) => item.status === "Berlaku").length;
  const latestYear = regulations.length
    ? Math.max(...regulations.map((item) => item.year)).toString()
    : "-";
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRegulations = normalizedQuery
    ? regulations.filter((regulation) => {
        const searchableText = [
          regulation.title,
          regulation.number,
          regulation.category,
          regulation.status,
          regulation.summary,
          regulation.year.toString(),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : regulations;
  const hasDocuments = regulations.length > 0;

  function downloadRegulation(regulation: VillageRegulation) {
    if (regulation.fileUrl) {
      window.open(regulation.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const content = [
      `Nomor: ${regulation.number}`,
      `Judul: ${regulation.title}`,
      `Kategori: ${regulation.category}`,
      `Tahun: ${regulation.year}`,
      `Status: ${regulation.status}`,
      `Tanggal Penetapan: ${formatDate(regulation.enactedAt)}`,
      "",
      regulation.summary,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");

    link.href = url;
    link.download = `${regulation.slug}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-12 pt-24 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.8)_52%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.5fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Dokumen / Perdes
            </p>
            <h1 className="mt-8 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Daftar Perdes dan dokumen hukum Desa Keseneng.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Warga dapat menelusuri peraturan desa, peraturan kepala desa,
              dan dokumen hukum lain yang menjadi dasar tata kelola desa.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={regulations.length.toString()} label="dokumen" />
            <HeroMetric value={activeCount.toString()} label="berlaku" />
            <HeroMetric value={categories.length.toString()} label="kategori" />
            <HeroMetric value={latestYear} label="tahun terbaru" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">Daftar Perdes</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Dokumen hukum disusun berdasarkan nomor, tahun, kategori, dan status.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            {categories.length > 0 ? (
              categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md bg-sage-100 px-3 py-2 text-xs font-semibold text-sage-800"
                >
                  {category}
                </span>
              ))
            ) : (
              <span className="rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-slate-600">
                Belum ada kategori
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label
              htmlFor="document-search"
              className="text-sm font-semibold text-slate-800"
            >
              Cari dokumen
            </label>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <input
                id="document-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari judul, nomor, kategori, status, atau tahun..."
                className="min-h-11 w-full rounded-md border border-slate-200 bg-stone-50 px-4 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-sage-700 focus:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={!hasDocuments}
              />
              <span className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-sage-100 px-3 py-2 text-sm font-semibold text-sage-800 sm:min-w-24">
                {filteredRegulations.length} hasil
              </span>
            </div>
          </div>

          {filteredRegulations.map((regulation) => (
            <article
              key={regulation.id}
              className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sage-700 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex max-w-full rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {regulation.category}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-950">
                    {regulation.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-sage-800">
                    Nomor {regulation.number}
                  </p>
                </div>
                <div className="w-fit rounded-md bg-slate-950 px-3 py-2 text-center text-white sm:shrink-0">
                  <strong className="block text-sm">{regulation.fileType}</strong>
                  <span className="text-[11px] text-slate-300">{regulation.fileSize}</span>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                {regulation.summary}
              </p>
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-slate-500">
                  <span>{regulation.year}</span>
                  <span aria-hidden="true"> / </span>
                  <time>{formatDate(regulation.enactedAt)}</time>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <span
                    className={`inline-flex h-10 items-center justify-center rounded-md px-3 text-xs font-semibold ${
                      regulation.status === "Berlaku"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {regulation.status}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 sm:min-w-36"
                    onClick={() => downloadRegulation(regulation)}
                  >
                    Unduh Dokumen
                  </button>
                </div>
              </div>
            </article>
          ))}
          {filteredRegulations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-sm sm:px-8 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-950">
                {hasDocuments ? "Dokumen tidak ditemukan" : "Belum ada dokumen"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {hasDocuments
                  ? "Coba gunakan kata kunci lain seperti nomor perdes, tahun, kategori, atau status dokumen."
                  : "Dokumen Perdes dan dokumen hukum desa akan tampil di sini setelah data tersedia."}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
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



