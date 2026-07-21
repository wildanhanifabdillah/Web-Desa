"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AdminNavigation } from "@/components/admin-navigation";

export type AdminCrudField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "hidden" | "file";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
  accept?: string;
  multiple?: boolean;
};

export type AdminCrudPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  publicHref?: string;
  idField?: string;
  deleteParam?: string;
  dataPath?: string[];
  fields: AdminCrudField[];
  tableColumns: Array<{ key: string; label: string }>;
  initialRows: Array<Record<string, unknown>>;
  createDefaults?: Record<string, unknown>;
  updateDefaults?: Record<string, unknown>;
  deleteExtraQuery?: Record<string, string>;
  rowActions?: Array<{ label: string; hrefTemplate: string }>;
  activeHref?: string;
  enableNewsAiDraft?: boolean;
};

type Notice = { type: "success" | "error"; message: string } | null;

type NewsAiDraft = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageAlt: string;
  authorName: string;
};

export function AdminCrudPage({
  title,
  eyebrow,
  description,
  endpoint,
  publicHref,
  idField = "id",
  deleteParam = "id",
  dataPath = ["data"],
  fields,
  tableColumns,
  initialRows,
  createDefaults = {},
  updateDefaults = {},
  deleteExtraQuery = {},
  rowActions = [],
  activeHref,
  enableNewsAiDraft = false,
}: AdminCrudPageProps) {
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedKey, setSelectedKey] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(() => buildInitialValues(fields, null));
  const [fileValues, setFileValues] = useState<Record<string, File[]>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);

  const rowKey = mode === "edit" ? selectedKey : "";
  const visibleFields = fields.filter((field) => field.type !== "hidden");
  const hasFileFields = fields.some((field) => field.type === "file");
  const publishedCount = rows.filter((row) => isPublishedStatus(row.status)).length;
  const archivedCount = rows.filter((row) => isArchivedStatus(row.status)).length;
  const draftCount = rows.length - publishedCount - archivedCount;
  const modalTitle = mode === "create" ? "Tambah data" : "Edit data";

  const metricSummary = useMemo(
    () => [
      { label: "Total data", value: rows.length.toString() },
      { label: "Publik/aktif", value: publishedCount.toString() },
      { label: "Draf", value: draftCount.toString() },
      { label: "Arsip", value: archivedCount.toString() },
    ],
    [archivedCount, draftCount, publishedCount, rows.length],
  );

  async function refreshRows() {
    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? "Gagal mengambil data terbaru.");
    }

    setRows(extractRows(payload, dataPath));
  }

  function startCreate() {
    setMode("create");
    setSelectedKey("");
    setFormValues(buildInitialValues(fields, null));
    setFileValues({});
    setNotice(null);
    setIsFormOpen(true);
  }

  function startEdit(row: Record<string, unknown>) {
    const key = String(row[idField] ?? row.slug ?? "");

    setMode("edit");
    setSelectedKey(key);
    setFormValues(buildInitialValues(fields, row));
    setFileValues({});
    setNotice(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setFileValues({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const payload = buildPayload(fields, formValues);
      const defaults = mode === "create" ? createDefaults : updateDefaults;
      const bodyPayload = {
        ...defaults,
        ...payload,
        ...(mode === "edit" ? { [idField]: rowKey } : {}),
      };
      const response = await fetch(
        endpoint,
        buildRequestInit(mode === "create" ? "POST" : "PUT", bodyPayload, fileValues, hasFileFields),
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error ?? "Data gagal disimpan.");
      }

      await refreshRows();
      setNotice({
        type: "success",
        message: mode === "create" ? "Data berhasil ditambahkan." : "Perubahan berhasil disimpan.",
      });
      setIsFormOpen(false);
      setFileValues({});

      if (mode === "create") {
        setFormValues(buildInitialValues(fields, null));
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Data gagal disimpan.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const key = String(deleteTarget[idField] ?? deleteTarget.slug ?? "");
    try {
      const params = new URLSearchParams({ [deleteParam]: key, ...deleteExtraQuery });
      const response = await fetch(`${endpoint}?${params.toString()}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Data gagal dihapus.");
      }

      await refreshRows();
      setDeleteTarget(null);
      setNotice({ type: "success", message: "Data berhasil dihapus." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Data gagal dihapus." });
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
              Dashboard
            </Link>
            {publicHref ? (
              <Link href={publicHref} className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
                Preview publik
              </Link>
            ) : null}
            <button type="button" onClick={startCreate} className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800">
              Tambah data
            </button>
          </div>
        </div>
      </section>

      <AdminNavigation activeHref={activeHref} />

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${notice.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {notice.message}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricSummary.map((metric) => (
            <MetricCard key={metric.label} value={metric.value} label={metric.label} />
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar data</h2>
              <p className="mt-1 text-sm text-slate-500">Pilih tambah, edit, atau hapus data dari tabel berikut.</p>
            </div>
            <button type="button" onClick={() => refreshRows().catch((error: Error) => setNotice({ type: "error", message: error.message }))} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800">
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column.key} className="px-5 py-3 font-semibold">{column.label}</th>
                  ))}
                  <th className="px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={String(row[idField] ?? row.slug ?? index)} className="align-top">
                    {tableColumns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-slate-700">{formatCell(row[column.key])}</td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEdit(row)} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                          Edit
                        </button>
                        {rowActions.map((action) => (
                          <Link key={action.label} href={buildRowActionHref(action.hrefTemplate, row)} className="rounded-md border border-sage-200 bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800 transition-colors hover:border-sage-300 hover:bg-sage-100">
                            {action.label}
                          </Link>
                        ))}
                        <button type="button" onClick={() => setDeleteTarget(row)} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 sm:py-10">
          <div role="dialog" aria-modal="true" className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{modalTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">Lengkapi data, lalu simpan perubahan.</p>
              </div>
              <button type="button" onClick={closeForm} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-lg font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800" aria-label="Tutup modal">
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              {enableNewsAiDraft ? (
                <div className="mb-5">
                  <NewsAiDraftPanel
                    onApply={(draft) => {
                      setMode("create");
                      setSelectedKey("");
                      setFormValues((current) => ({
                        ...current,
                        title: draft.title,
                        excerpt: draft.excerpt,
                        content: draft.content,
                        category: draft.category,
                        imageAlt: draft.imageAlt,
                        authorName: draft.authorName,
                        status: "draft",
                      }));
                      setNotice({ type: "success", message: "Draft AI berhasil dibuat. Silakan tinjau dan edit sebelum disimpan." });
                    }}
                    onError={(message) => setNotice({ type: "error", message })}
                  />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                {visibleFields.map((field) => (
                  <CrudInput
                    key={field.name}
                    field={field}
                    value={formValues[field.name] ?? ""}
                    storedValue={getStoredFileValue(field, formValues)}
                    file={fileValues[field.name] ?? []}
                    onChange={(value) => setFormValues((current) => ({ ...current, [field.name]: value }))}
                    onFileChange={(files) => setFileValues((current) => ({ ...current, [field.name]: files }))}
                    onClearStoredFile={() => {
                      setFileValues((current) => ({ ...current, [field.name]: [] }));
                      setFormValues((current) => clearStoredFileValue(field, current));
                    }}
                  />
                ))}
                {fields.filter((field) => field.type === "hidden").map((field) => (
                  <input key={field.name} type="hidden" value={formValues[field.name] ?? ""} readOnly />
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-slate-400">
                  {isSaving ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg border border-red-100 bg-white p-5 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">Hapus {getRowLabel(deleteTarget)}?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Data ini akan dihapus dari daftar admin dan halaman publik terkait.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                Batalkan
              </button>
              <button type="button" onClick={confirmDelete} className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                Ya, hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function NewsAiDraftPanel({ onApply, onError }: { onApply: (draft: NewsAiDraft) => void; onError: (message: string) => void }) {
  const [form, setForm] = useState({
    topic: "",
    eventFact: "",
    location: "",
    eventDate: new Date().toISOString().slice(0, 10),
    newsType: "Kegiatan",
    category: "Pemerintahan",
    people: "",
    supportingData: "",
    style: "Portal berita",
    paragraphCount: "4",
    authorName: "Admin Desa Keseneng",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/news/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paragraphCount: Number(form.paragraphCount) }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Draft AI error", { status: response.status, payload });
        throw new Error(payload?.error ?? `Draft AI gagal dibuat. HTTP ${response.status}`);
      }

      onApply({
        title: payload.data.title,
        excerpt: payload.data.excerpt,
        content: payload.data.content,
        category: payload.data.category,
        imageAlt: payload.data.imageAlt,
        authorName: payload.data.authorName ?? form.authorName,
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Draft AI gagal dibuat.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-lg border border-sage-200 bg-sage-50 p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Buat draft AI</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">Isi fakta utama, lalu Gemini akan membuat draft berita yang tetap bisa diedit sebelum disimpan.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextInput label="Topik utama" value={form.topic} onChange={(value) => setForm((current) => ({ ...current, topic: value }))} placeholder="Pelatihan pembuatan mineral block" />
        <TextInput label="Lokasi" value={form.location} onChange={(value) => setForm((current) => ({ ...current, location: value }))} placeholder="Sanggar Desa Keseneng" />
        <div className="sm:col-span-2">
          <TextArea label="Fakta kejadian" value={form.eventFact} onChange={(value) => setForm((current) => ({ ...current, eventFact: value }))} placeholder="Tuliskan apa yang terjadi secara faktual." />
        </div>
        <TextInput label="Tanggal" type="date" value={form.eventDate} onChange={(value) => setForm((current) => ({ ...current, eventDate: value }))} />
        <SelectInput label="Jenis" value={form.newsType} onChange={(value) => setForm((current) => ({ ...current, newsType: value }))} options={["Kegiatan", "Pengumuman", "Prestasi", "Kejadian", "Promosi"]} />
        <SelectInput label="Kategori" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} options={["Pemerintahan", "Kesehatan", "Pendidikan", "Teknologi", "Ekonomi", "Olahraga", "Pembangunan", "Sosial", "Budaya"]} />
        <SelectInput label="Gaya" value={form.style} onChange={(value) => setForm((current) => ({ ...current, style: value }))} options={["Portal berita", "Formal", "Singkat", "SEO"]} />
        <TextInput label="Pihak terlibat" value={form.people} onChange={(value) => setForm((current) => ({ ...current, people: value }))} placeholder="Opsional" />
        <SelectInput label="Paragraf" value={form.paragraphCount} onChange={(value) => setForm((current) => ({ ...current, paragraphCount: value }))} options={["3", "4", "5", "6"]} />
        <div className="sm:col-span-2">
          <TextArea label="Data/kutipan" value={form.supportingData} onChange={(value) => setForm((current) => ({ ...current, supportingData: value }))} placeholder="Opsional, misalnya jumlah peserta atau kutipan narasumber." />
        </div>
        <button type="button" onClick={handleGenerate} disabled={isGenerating} className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800 disabled:cursor-wait disabled:bg-slate-400 sm:col-span-2">
          {isGenerating ? "Membuat draft..." : "Buat draft dengan Gemini"}
        </button>
      </div>
    </section>
  );
}

function CrudInput({
  field,
  value,
  storedValue,
  file,
  onChange,
  onFileChange,
  onClearStoredFile,
}: {
  field: AdminCrudField;
  value: string;
  storedValue: string;
  file: File[];
  onChange: (value: string) => void;
  onFileChange: (files: File[]) => void;
  onClearStoredFile: () => void;
}) {
  const isWide = field.type === "textarea" || field.type === "file";

  return (
    <div className={isWide ? "sm:col-span-2" : undefined}>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700" value={value} onChange={(event) => onChange(event.target.value)} required={field.required} />
      ) : field.type === "select" ? (
        <select className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700" value={value} onChange={(event) => onChange(event.target.value)} required={field.required}>
          {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : field.type === "file" ? (
        <div className="mt-2 grid gap-2">
          <input type="file" accept={field.accept} multiple={field.multiple} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-sage-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" onChange={(event) => onFileChange(Array.from(event.target.files ?? []))} required={field.required} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{getFileStatusText(field, storedValue, file)}</span>
            {storedValue ? (
              <button type="button" onClick={onClearStoredFile} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100">
                Hapus file
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700" value={value} onChange={(event) => onChange(event.target.value)} required={field.required} />
      )}
    </div>
  );
}

function getFileStatusText(field: AdminCrudField, storedValue: string, files: File[]) {
  if (files.length > 0) {
    return files.map((item) => item.name).join(", ");
  }

  if (!storedValue) {
    return "Belum ada file dipilih.";
  }

  return isPdfField(field) ? "PDF sudah tersimpan." : "Gambar sudah tersimpan.";
}

function isPdfField(field: AdminCrudField) {
  return field.accept?.includes("pdf") ?? false;
}
function TextInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700" />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700" />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
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

function isPublishedStatus(status: unknown) {
  const value = String(status ?? "").toLowerCase();

  return value.includes("publish") || value === "dipublikasikan" || value === "berlaku";
}

function isArchivedStatus(status: unknown) {
  const value = String(status ?? "").toLowerCase();

  return value === "archived" || value === "arsip";
}

function getStoredFileValue(field: AdminCrudField, values: Record<string, string>) {
  if (field.name === "photoFile") {
    return values.photoUrl ?? "";
  }

  if (field.name === "file") {
    return values.fileUrl ?? values.imageUrl ?? values.image ?? values.coverImage ?? values.thumbnailUrl ?? "";
  }

  return values[field.name] ?? "";
}

function clearStoredFileValue(field: AdminCrudField, values: Record<string, string>) {
  if (field.name === "photoFile") {
    return { ...values, photoFile: "", photoUrl: "", photoAlt: "" };
  }

  if (field.name === "file") {
    return { ...values, file: "", fileUrl: "", imageUrl: "", image: "", coverImage: "", thumbnailUrl: "" };
  }

  return { ...values, [field.name]: "" };
}

function buildInitialValues(fields: AdminCrudField[], row: Record<string, unknown> | null) {
  return Object.fromEntries(fields.map((field) => {
    const rawValue = row?.[field.name] ?? field.defaultValue ?? "";
    const value = field.type === "date" ? formatDateInputValue(rawValue) : String(rawValue);

    return [field.name, value];
  })) as Record<string, string>;
}

function buildPayload(fields: AdminCrudField[], values: Record<string, string>) {
  return Object.fromEntries(fields.filter((field) => field.type !== "file").map((field) => {
    const value = values[field.name] ?? field.defaultValue ?? "";

    return [field.name, field.type === "number" ? Number(value) : value];
  }));
}

function buildRequestInit(method: "POST" | "PUT", payload: Record<string, unknown>, files: Record<string, File[]>, asFormData: boolean): RequestInit {
  if (!asFormData) {
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  }

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });

  Object.entries(files).forEach(([key, fileList]) => {
    fileList.forEach((file) => formData.append(key, file));
  });

  return { method, body: formData };
}

function extractRows(payload: unknown, dataPath: string[]) {
  let current: unknown = payload;

  for (const key of dataPath) {
    current = current && typeof current === "object" ? (current as Record<string, unknown>)[key] : null;
  }

  return Array.isArray(current) ? current as Array<Record<string, unknown>> : [];
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return value.toLocaleString("id-ID");
  }

  if (typeof value === "string") {
    const status = formatAdminStatus(value);
    const slugLabel = formatKnownSlug(value);

    if (status) {
      return status;
    }

    if (slugLabel) {
      return slugLabel;
    }

    if (isDateLikeValue(value)) {
      return formatAdminDate(value);
    }

    return value.length > 90 ? `${value.slice(0, 90)}...` : value;
  }

  return JSON.stringify(value);
}

function formatAdminStatus(value: string) {
  const statuses: Record<string, string> = {
    draft: "Draf",
    published: "Publik",
    archived: "Arsip",
    draf: "Draf",
    dipublikasikan: "Dipublikasikan",
    berlaku: "Berlaku",
    arsip: "Arsip",
  };
  const normalized = value.toLowerCase();

  return statuses[normalized] ?? null;
}

function formatKnownSlug(value: string) {
  const labels: Record<string, string> = {
    pertanian: "Pertanian",
    kesenian: "Kesenian",
    umkm: "UMKM",
    peternakan: "Peternakan",
    pemerintahan: "Pemerintahan",
    kesehatan: "Kesehatan",
    pendidikan: "Pendidikan",
    teknologi: "Teknologi",
    ekonomi: "Ekonomi",
    olahraga: "Olahraga",
    pembangunan: "Pembangunan",
    sosial: "Sosial",
    budaya: "Budaya",
  };
  const normalized = value.toLowerCase();

  return labels[normalized] ?? null;
}
function formatDateInputValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.match(/^\d{4}-\d{2}-\d{2}/);

  return match?.[0] ?? value;
}

function isDateLikeValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value);
}

function formatAdminDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
function getRowLabel(row: Record<string, unknown>) {
  return String(row.title ?? row.name ?? row.label ?? row.slug ?? row.id ?? "data");
}

function buildRowActionHref(template: string, row: Record<string, unknown>) {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (_match, key: string) => encodeURIComponent(String(row[key] ?? "")));
}









