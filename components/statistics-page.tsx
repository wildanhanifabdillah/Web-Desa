"use client";

import { useState } from "react";
import type { StatisticChartItem, StatisticMetric, StatisticSection } from "@/lib/statistics";

type StatisticsPageProps = {
  overview: StatisticMetric[];
  sections: StatisticSection[];
};

type ActiveBar = {
  label: string;
  value: number;
  percentage: number;
};

export function StatisticsPage({ overview, sections }: StatisticsPageProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const activeSection =
    sections.find((section) => section.id === activeSectionId) ?? sections[0];

  function downloadCsv() {
    const rows = [
      ["jenis", "kategori", "label", "nilai", "satuan"],
      ...overview.map((metric) => [
        "ringkasan",
        "Ringkasan Utama",
        metric.label,
        metric.value.toString(),
        metric.unit,
      ]),
      ...sections.flatMap((section) =>
        section.items.map((item) => [
          "grafik",
          section.title,
          item.label,
          item.value.toString(),
          section.unit,
        ]),
      ),
    ];
    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "statistik-desa-keseneng.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.78)_52%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.5fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Statistik Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Data kependudukan dan sosial Desa Keseneng dalam tampilan ringkas.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Halaman statistik menyajikan data tiruan untuk membaca komposisi
              warga, pendidikan, pekerjaan, dan cakupan wilayah desa secara
              visual.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            {overview.slice(0, 4).map((metric) => (
              <HeroMetric
                key={metric.id}
                value={formatNumber(metric.value)}
                label={metric.unit}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="section-kicker">Ringkasan Utama</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Indikator dasar untuk membaca kondisi umum desa.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overview.map((metric) => (
            <article
              key={metric.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {metric.label}
              </p>
              <div className="mt-4 flex items-end gap-2">
                <strong className="text-3xl font-semibold text-slate-950">
                  {formatNumber(metric.value)}
                </strong>
                <span className="pb-1 text-sm font-medium text-slate-500">
                  {metric.unit}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {metric.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="section-kicker">Visualisasi Data</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Grafik sederhana untuk membandingkan kelompok data utama.
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 sm:w-auto"
              onClick={downloadCsv}
            >
              Unduh CSV
            </button>
          </div>
          <div className="mt-8 rounded-lg border border-slate-200 bg-stone-50 p-3 shadow-sm">
            <div className="hidden gap-2 md:flex" role="tablist" aria-label="Kategori statistik">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={section.id === activeSectionId}
                  className={`h-11 flex-1 rounded-md px-4 text-sm font-semibold transition-colors ${
                    section.id === activeSectionId
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-700 hover:bg-sage-50 hover:text-sage-800"
                  }`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>
            <label className="block md:hidden">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Kategori statistik
              </span>
              <select
                value={activeSectionId}
                onChange={(event) => setActiveSectionId(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-100"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeSection ? (
            <div className="mt-5 max-w-4xl">
              <StatisticChart section={activeSection} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function StatisticChart({ section }: { section: StatisticSection }) {
  const [activeBar, setActiveBar] = useState<ActiveBar | null>(null);
  const maxValue = Math.max(...section.items.map((item) => item.value));

  return (
    <article className="rounded-lg border border-slate-200 bg-stone-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {section.totalLabel}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {section.title}
          </h3>
        </div>
        <div className="text-right">
          <strong className="block text-2xl font-semibold text-slate-950">
            {formatNumber(section.totalValue)}
          </strong>
          <span className="text-xs text-slate-500">{section.unit}</span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {section.description}
      </p>
      <div className="relative mt-6 grid gap-4">
        {activeBar ? (
          <div className="pointer-events-none absolute right-0 top-0 z-10 max-w-[14rem] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            <strong className="block text-slate-950">{activeBar.label}</strong>
            <span className="mt-1 block text-slate-600">
              {formatNumber(activeBar.value)} {section.unit} ({activeBar.percentage.toFixed(1)}%)
            </span>
          </div>
        ) : null}
        {section.items.map((item) => (
          <InteractiveBar
            key={item.label}
            item={item}
            maxValue={maxValue}
            totalValue={section.totalValue}
            unit={section.unit}
            onActiveChange={setActiveBar}
          />
        ))}
      </div>
    </article>
  );
}

function InteractiveBar({
  item,
  maxValue,
  totalValue,
  unit,
  onActiveChange,
}: {
  item: StatisticChartItem;
  maxValue: number;
  totalValue: number;
  unit: string;
  onActiveChange: (bar: ActiveBar | null) => void;
}) {
  const width = `${Math.max((item.value / maxValue) * 100, 8)}%`;
  const percentage = (item.value / totalValue) * 100;
  const activeBar = {
    label: item.label,
    value: item.value,
    percentage,
  };

  return (
    <button
      type="button"
      className="group block w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2"
      aria-label={`${item.label}: ${formatNumber(item.value)} ${unit}, ${percentage.toFixed(1)} persen`}
      onBlur={() => onActiveChange(null)}
      onFocus={() => onActiveChange(activeBar)}
      onMouseEnter={() => onActiveChange(activeBar)}
      onMouseLeave={() => onActiveChange(null)}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{item.label}</span>
        <span className="font-semibold text-slate-950">
          {formatNumber(item.value)}
        </span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
        <div
          className={`flex h-full items-center justify-end rounded-full pr-2 text-[10px] font-semibold text-white transition-all duration-300 group-hover:brightness-110 ${item.colorClassName}`}
          style={{ width }}
        >
          {percentage.toFixed(0)}%
        </div>
      </div>
    </button>
  );
}

function escapeCsvCell(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4">
      <strong className="block text-2xl font-semibold">{value}</strong>
      <span className="mt-1 block text-sm text-slate-200">{label}</span>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}



