"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AdminNavigation } from "@/components/admin-navigation";
import type {
  AdminStatisticMetric,
  AdminStatisticSection,
} from "@/lib/admin-statistics-store";
import type { StatisticChartItem } from "@/lib/statistics";
import type { StatisticStatus } from "@/lib/statistics-model";

type AdminStatisticsManagerProps = {
  initialMetrics: AdminStatisticMetric[];
  initialSections: AdminStatisticSection[];
};

type Notice = { type: "success" | "error"; message: string } | null;
type AdminTab = "metrics" | "charts";
type ChartMode = "section" | "item";
type MetricForm = {
  id: string;
  label: string;
  slug: string;
  category: string;
  value: string;
  unit: string;
  description: string;
  sourceName: string;
  periodLabel: string;
  status: StatisticStatus;
  featured: boolean;
};
type SectionForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  totalLabel: string;
  totalValue: string;
  unit: string;
  sourceName: string;
  periodLabel: string;
  status: StatisticStatus;
};
type ChartItemForm = {
  sectionId: string;
  currentLabel: string;
  label: string;
  value: string;
  colorClassName: string;
};

const endpoint = "/api/admin/statistics";
const statusOptions: Array<{ label: string; value: StatisticStatus }> = [
  { label: "Draf", value: "draft" },
  { label: "Publik", value: "published" },
  { label: "Arsip", value: "archived" },
];
const colorOptions = [
  { label: "Sage", value: "bg-sage-600" },
  { label: "Hijau", value: "bg-emerald-500" },
  { label: "Biru", value: "bg-sky-500" },
  { label: "Kuning", value: "bg-amber-500" },
  { label: "Jingga", value: "bg-orange-500" },
  { label: "Indigo", value: "bg-indigo-500" },
];

export function AdminStatisticsManager({
  initialMetrics,
  initialSections,
}: AdminStatisticsManagerProps) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [sections, setSections] = useState(initialSections);
  const [activeTab, setActiveTab] = useState<AdminTab>("metrics");
  const [chartMode, setChartMode] = useState<ChartMode>("section");
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [metricForm, setMetricForm] = useState<MetricForm>(() => metricToForm(initialMetrics[0]));
  const [sectionForm, setSectionForm] = useState<SectionForm>(() => sectionToForm(initialSections[0]));
  const [itemForm, setItemForm] = useState<ChartItemForm>(() => emptyItemForm(initialSections[0]?.id ?? ""));
  const [editingMetricId, setEditingMetricId] = useState(initialMetrics[0]?.id ?? "");
  const [editingSectionId, setEditingSectionId] = useState(initialSections[0]?.id ?? "");
  const [editingItemLabel, setEditingItemLabel] = useState("");

  const publishedMetrics = metrics.filter((item) => item.status === "published").length;
  const publishedSections = sections.filter((item) => item.status === "published").length;
  const chartItemCount = sections.reduce((total, section) => total + section.items.length, 0);
  const selectedItemSection = sections.find((section) => section.id === itemForm.sectionId) ?? sections[0];
  const metricSummary = useMemo(
    () => [
      { label: "Indikator", value: metrics.length.toString() },
      { label: "Grafik", value: sections.length.toString() },
      { label: "Item grafik", value: chartItemCount.toString() },
      { label: "Tampil publik", value: (publishedMetrics + publishedSections).toString() },
    ],
    [chartItemCount, metrics.length, publishedMetrics, publishedSections, sections.length],
  );

  async function refreshRecords() {
    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? "Gagal mengambil data statistik.");
    }

    setMetrics(payload?.data?.metrics ?? []);
    setSections(payload?.data?.sections ?? []);
  }

  async function submitMetric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingMetricId) {
      setNotice({ type: "error", message: "Pilih indikator yang ingin diubah." });
      return;
    }

    await saveRecord("PUT", {
      type: "metric",
      id: editingMetricId || undefined,
      slug: metricForm.slug,
      label: metricForm.label,
      category: metricForm.category,
      value: Number(metricForm.value),
      unit: metricForm.unit,
      description: metricForm.description,
      sourceName: metricForm.sourceName,
      periodLabel: metricForm.periodLabel,
      status: metricForm.status,
      featured: metricForm.featured,
    }, () => undefined);
  }

  async function submitSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSectionId) {
      setNotice({ type: "error", message: "Pilih kategori grafik yang ingin diubah." });
      return;
    }

    await saveRecord("PUT", {
      type: "section",
      id: editingSectionId,
      slug: sectionForm.slug,
      title: sectionForm.title,
      description: sectionForm.description,
      totalLabel: sectionForm.totalLabel,
      totalValue: Number(sectionForm.totalValue),
      unit: sectionForm.unit,
      sourceName: sectionForm.sourceName,
      periodLabel: sectionForm.periodLabel,
      status: sectionForm.status,
    }, () => undefined);
  }

  async function submitChartItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItemLabel) {
      setNotice({ type: "error", message: "Pilih item grafik dari tabel yang ingin diubah." });
      return;
    }

    await saveRecord("PUT", {
      type: "chart-item",
      sectionId: itemForm.sectionId,
      currentLabel: editingItemLabel || undefined,
      label: itemForm.label,
      value: Number(itemForm.value),
      colorClassName: itemForm.colorClassName,
    }, () => undefined);
  }

  async function saveRecord(method: "POST" | "PUT", body: Record<string, unknown>, onSuccess: () => void) {
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Data statistik gagal disimpan.");
      }

      await refreshRecords();
      onSuccess();
      setNotice({ type: "success", message: "Data statistik berhasil disimpan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Data statistik gagal disimpan." });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(query: Record<string, string>) {
    if (!window.confirm("Hapus data statistik ini?")) {
      return;
    }

    setNotice(null);

    try {
      const params = new URLSearchParams(query);
      const response = await fetch(`${endpoint}?${params.toString()}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Data statistik gagal dihapus.");
      }

      await refreshRecords();
      setNotice({ type: "success", message: "Data statistik berhasil dihapus." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Data statistik gagal dihapus." });
    }
  }

  function editMetric(metric: AdminStatisticMetric) {
    setActiveTab("metrics");
    setEditingMetricId(metric.id);
    setMetricForm({
      id: metric.id,
      label: metric.label,
      slug: metric.slug,
      category: metric.category,
      value: String(metric.value),
      unit: metric.unit,
      description: metric.description,
      sourceName: metric.sourceName,
      periodLabel: metric.periodLabel,
      status: metric.status,
      featured: metric.featured,
    });
  }

  function editSection(section: AdminStatisticSection) {
    setActiveTab("charts");
    setChartMode("section");
    setEditingSectionId(section.id);
    setSectionForm({
      id: section.id,
      title: section.title,
      slug: section.slug,
      description: section.description,
      totalLabel: section.totalLabel,
      totalValue: String(section.totalValue),
      unit: section.unit,
      sourceName: section.sourceName,
      periodLabel: section.periodLabel,
      status: section.status,
    });
  }

  function editChartItem(section: AdminStatisticSection, item: StatisticChartItem) {
    setActiveTab("charts");
    setChartMode("item");
    setEditingItemLabel(item.label);
    setItemForm({
      sectionId: section.id,
      currentLabel: item.label,
      label: item.label,
      value: String(item.value),
      colorClassName: item.colorClassName,
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">Admin Statistik Desa</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Kelola statistik website</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Kelola indikator ringkasan dan grafik statistik yang tampil pada halaman publik.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
              Dasbor
            </Link>
            <Link href="/statistik" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
              Lihat halaman
            </Link>
            <button type="button" onClick={() => setActiveTab("charts")} className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800">
              Kelola grafik
            </button>
          </div>
        </div>
      </section>

      <AdminNavigation activeHref="/admin/statistik" />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {notice.message}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricSummary.map((metric) => <MetricCard key={metric.label} value={metric.value} label={metric.label} />)}
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <TabButton label="Indikator Ringkasan" active={activeTab === "metrics"} onClick={() => setActiveTab("metrics")} />
          <TabButton label="Grafik Statistik" active={activeTab === "charts"} onClick={() => setActiveTab("charts")} />
        </div>

        {activeTab === "metrics" ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <DataPanel title="Indikator ringkasan" description="Angka utama di bagian atas halaman statistik publik.">
              <table className="w-full min-w-[860px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Indikator</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Nilai</th>
                    <th className="px-5 py-3 font-semibold">Satuan</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.map((metric) => (
                    <tr key={metric.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">{metric.label}</td>
                      <td className="px-5 py-4 text-slate-700">{metric.category}</td>
                      <td className="px-5 py-4 text-slate-700">{metric.value.toLocaleString("id-ID")}</td>
                      <td className="px-5 py-4 text-slate-700">{metric.unit}</td>
                      <td className="px-5 py-4 text-slate-700">{formatStatus(metric.status)}</td>
                      <td className="px-5 py-4">
                        <RowActions onEdit={() => editMetric(metric)} onDelete={() => deleteRecord({ type: "metric", id: metric.id })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataPanel>

            <MetricFormPanel
              form={metricForm}
              metrics={metrics}
              editing={Boolean(editingMetricId)}
              isSaving={isSaving}
              onSubmit={submitMetric}
              onSelect={(metricId) => {
                const metric = metrics.find((item) => item.id === metricId);

                setEditingMetricId(metric?.id ?? "");
                setMetricForm(metricToForm(metric));
              }}
              onReset={() => {
                const metric = metrics.find((item) => item.id === editingMetricId) ?? metrics[0];

                setEditingMetricId(metric?.id ?? "");
                setMetricForm(metricToForm(metric));
              }}
              onChange={(patch) => setMetricForm((current) => ({ ...current, ...patch }))}
            />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
            <div className="grid gap-5">
              <DataPanel title="Kategori grafik" description="Kategori dan item yang menjadi tab grafik di halaman statistik publik.">
                <div className="grid gap-4 p-5 lg:grid-cols-3">
                  {sections.map((section) => (
                    <article key={section.id} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-950">{section.title}</h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">{formatStatus(section.status)} - {section.periodLabel}</p>
                        </div>
                        <span className="rounded-md bg-sage-50 px-2 py-1 text-xs font-semibold text-sage-800">{section.items.length} item</span>
                      </div>
                      <strong className="mt-4 block text-2xl font-semibold text-slate-950">
                        {section.totalValue.toLocaleString("id-ID")} {section.unit}
                      </strong>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => editSection(section)} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Ubah kategori</button>
                        <button type="button" onClick={() => deleteRecord({ type: "section", id: section.id })} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Hapus</button>
                      </div>
                    </article>
                  ))}
                </div>
              </DataPanel>

              <DataPanel title="Item grafik" description="Baris pembanding di dalam tiap kategori grafik.">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Kategori</th>
                        <th className="px-5 py-3 font-semibold">Label</th>
                        <th className="px-5 py-3 font-semibold">Nilai</th>
                        <th className="px-5 py-3 font-semibold">Warna</th>
                        <th className="px-5 py-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sections.flatMap((section) => section.items.map((item) => ({ section, item }))).map(({ section, item }) => (
                        <tr key={`${section.id}-${item.label}`}>
                          <td className="px-5 py-4 text-slate-700">{section.title}</td>
                          <td className="px-5 py-4 font-semibold text-slate-950">{item.label}</td>
                          <td className="px-5 py-4 text-slate-700">{item.value.toLocaleString("id-ID")}</td>
                          <td className="px-5 py-4"><span className={`inline-flex h-4 w-10 rounded-full ${item.colorClassName}`} /></td>
                          <td className="px-5 py-4">
                            <RowActions
                              onEdit={() => editChartItem(section, item)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataPanel>
            </div>

            <aside className="grid gap-5 self-start">
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                <TabButton label="Kategori Grafik" active={chartMode === "section"} onClick={() => setChartMode("section")} />
                <TabButton label="Item Grafik" active={chartMode === "item"} onClick={() => setChartMode("item")} />
              </div>
              {chartMode === "section" ? (
                <SectionFormPanel
                  form={sectionForm}
                  sections={sections}
                  editing={Boolean(editingSectionId)}
                  isSaving={isSaving}
                  onSubmit={submitSection}
                  onSelect={(sectionId) => {
                    const section = sections.find((item) => item.id === sectionId);

                    setEditingSectionId(section?.id ?? "");
                    setSectionForm(sectionToForm(section));
                  }}
                  onReset={() => {
                    const section = sections.find((item) => item.id === editingSectionId) ?? sections[0];

                    setEditingSectionId(section?.id ?? "");
                    setSectionForm(sectionToForm(section));
                  }}
                  onChange={(patch) => setSectionForm((current) => ({ ...current, ...patch }))}
                />
              ) : (
                <ChartItemFormPanel
                  form={itemForm}
                  sections={sections}
                  selectedSection={selectedItemSection}
                  editing={Boolean(editingItemLabel)}
                  isSaving={isSaving}
                  onSubmit={submitChartItem}
                  onReset={() => {
                    setItemForm(emptyItemForm(itemForm.sectionId));
                    setEditingItemLabel("");
                  }}
                  onChange={(patch) => setItemForm((current) => ({ ...current, ...patch }))}
                />
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricFormPanel({ form, metrics, editing, isSaving, onSubmit, onSelect, onReset, onChange }: {
  form: MetricForm;
  metrics: AdminStatisticMetric[];
  editing: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelect: (metricId: string) => void;
  onReset: () => void;
  onChange: (patch: Partial<MetricForm>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <FormTitle title="Ubah indikator" description="Pilih indikator yang sudah ada, lalu ubah data kartu ringkasannya." />
      <div className="mt-5 grid gap-4">
        <SelectInput
          label="Indikator"
          value={form.id}
          options={metrics.map((metric) => ({ label: metric.label, value: metric.id }))}
          onChange={onSelect}
        />
        <TextInput label="Nama indikator" value={form.label} required onChange={(label) => onChange({ label })} />
        <TextInput label="Kategori" value={form.category} required onChange={(category) => onChange({ category })} />
        <TextInput label="Nilai" type="number" value={form.value} required onChange={(value) => onChange({ value })} />
        <TextInput label="Satuan" value={form.unit} required onChange={(unit) => onChange({ unit })} />
        <TextInput label="Sumber data" value={form.sourceName} onChange={(sourceName) => onChange({ sourceName })} />
        <TextInput label="Periode" value={form.periodLabel} onChange={(periodLabel) => onChange({ periodLabel })} />
        <TextArea label="Deskripsi" value={form.description} required onChange={(description) => onChange({ description })} />
        <SelectInput label="Status" value={form.status} options={statusOptions} onChange={(status) => onChange({ status: status as StatisticStatus })} />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.featured} onChange={(event) => onChange({ featured: event.target.checked })} />
          Tampilkan sebagai indikator utama
        </label>
        <FormActions editing={editing} isSaving={isSaving} onReset={onReset} />
      </div>
    </form>
  );
}

function SectionFormPanel({ form, sections, editing, isSaving, onSubmit, onSelect, onReset, onChange }: {
  form: SectionForm;
  sections: AdminStatisticSection[];
  editing: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelect: (sectionId: string) => void;
  onReset: () => void;
  onChange: (patch: Partial<SectionForm>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <FormTitle title="Ubah kategori grafik" description="Pilih kategori yang sudah ada, lalu ubah data yang tampil di halaman publik." />
      <div className="mt-5 grid gap-4">
        <SelectInput
          label="Kategori grafik"
          value={form.id}
          options={sections.map((section) => ({ label: section.title, value: section.id }))}
          onChange={onSelect}
        />
        <TextInput label="Judul grafik" value={form.title} required onChange={(title) => onChange({ title })} />
        <TextInput label="Label total" value={form.totalLabel} required onChange={(totalLabel) => onChange({ totalLabel })} />
        <TextInput label="Nilai total" type="number" value={form.totalValue} required onChange={(totalValue) => onChange({ totalValue })} />
        <TextInput label="Satuan" value={form.unit} required onChange={(unit) => onChange({ unit })} />
        <TextInput label="Sumber data" value={form.sourceName} onChange={(sourceName) => onChange({ sourceName })} />
        <TextInput label="Periode" value={form.periodLabel} onChange={(periodLabel) => onChange({ periodLabel })} />
        <TextArea label="Deskripsi" value={form.description} required onChange={(description) => onChange({ description })} />
        <SelectInput label="Status" value={form.status} options={statusOptions} onChange={(status) => onChange({ status: status as StatisticStatus })} />
        <FormActions editing={editing} isSaving={isSaving} onReset={onReset} />
      </div>
    </form>
  );
}

function ChartItemFormPanel({ form, sections, selectedSection, editing, isSaving, onSubmit, onReset, onChange }: {
  form: ChartItemForm;
  sections: AdminStatisticSection[];
  selectedSection?: AdminStatisticSection;
  editing: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onChange: (patch: Partial<ChartItemForm>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <FormTitle title="Ubah item grafik" description="Pilih item dari tabel, lalu ubah label, nilai, atau warnanya." />
      <div className="mt-5 grid gap-4">
        <SelectInput
          label="Kategori grafik"
          value={form.sectionId || selectedSection?.id || ""}
          options={sections.map((section) => ({ label: section.title, value: section.id }))}
          onChange={(sectionId) => onChange({ sectionId })}
        />
        <TextInput label="Label item" value={form.label} required onChange={(label) => onChange({ label })} />
        <TextInput label="Nilai" type="number" value={form.value} required onChange={(value) => onChange({ value })} />
        <SelectInput label="Warna" value={form.colorClassName} options={colorOptions} onChange={(colorClassName) => onChange({ colorClassName })} />
        <FormActions editing={editing} isSaving={isSaving} onReset={onReset} />
      </div>
    </form>
  );
}

function DataPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <strong className="block text-2xl font-semibold leading-none text-slate-950">{value}</strong>
      <span className="mt-2 block text-sm text-slate-500">{label}</span>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-10 rounded-md px-4 text-sm font-semibold transition-colors ${active ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-sage-50 hover:text-sage-800"}`}>
      {label}
    </button>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onEdit} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Ubah</button>
      {onDelete ? (
        <button type="button" onClick={onDelete} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Hapus</button>
      ) : null}
    </div>
  );
}

function FormTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function FormActions({ editing, isSaving, onReset }: { editing: boolean; isSaving: boolean; onReset: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
      <button type="button" onClick={onReset} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
        Batal
      </button>
      <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-slate-400">
        {isSaving ? "Menyimpan..." : editing ? "Perbarui" : "Simpan"}
      </button>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700" />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <textarea value={value} required={required} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700" />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function metricToForm(metric: AdminStatisticMetric | undefined): MetricForm {
  return {
    id: metric?.id ?? "",
    label: metric?.label ?? "",
    slug: metric?.slug ?? "",
    category: metric?.category ?? "Kependudukan",
    value: String(metric?.value ?? 0),
    unit: metric?.unit ?? "jiwa",
    description: metric?.description ?? "",
    sourceName: metric?.sourceName ?? "Data Desa Keseneng",
    periodLabel: metric?.periodLabel ?? "2026",
    status: metric?.status ?? "draft",
    featured: metric?.featured ?? true,
  };
}

function sectionToForm(section: AdminStatisticSection | undefined): SectionForm {
  return {
    id: section?.id ?? "",
    title: section?.title ?? "",
    slug: section?.slug ?? "",
    description: section?.description ?? "",
    totalLabel: section?.totalLabel ?? "Total data",
    totalValue: String(section?.totalValue ?? 0),
    unit: section?.unit ?? "orang",
    sourceName: section?.sourceName ?? "Data Desa Keseneng",
    periodLabel: section?.periodLabel ?? "2026",
    status: section?.status ?? "draft",
  };
}

function emptyItemForm(sectionId: string): ChartItemForm {
  return {
    sectionId,
    currentLabel: "",
    label: "",
    value: "0",
    colorClassName: "bg-sage-600",
  };
}

function formatStatus(status: StatisticStatus) {
  return status === "published" ? "Publik" : status === "archived" ? "Arsip" : "Draf";
}