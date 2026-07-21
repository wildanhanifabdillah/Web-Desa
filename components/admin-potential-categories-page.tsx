"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { PotentialCategory } from "@/lib/potential-categories";

type AdminPotentialCategoriesPageProps = {
  categories: PotentialCategory[];
};

type CategoryFormValues = {
  label: string;
  slug: string;
  title: string;
  summary: string;
};

type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

const emptyFormValues: CategoryFormValues = {
  label: "",
  slug: "",
  title: "",
  summary: "",
};

export function AdminPotentialCategoriesPage({
  categories,
}: AdminPotentialCategoriesPageProps) {
  const totalGalleryItems = categories.reduce(
    (total, category) => total + category.gallery.length,
    0,
  );
  const firstCategory = categories[0];
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedSlug, setSelectedSlug] = useState(firstCategory?.slug ?? "");
  const [formValues, setFormValues] = useState<CategoryFormValues>(
    firstCategory ? toFormValues(firstCategory) : emptyFormValues,
  );
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PotentialCategory | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const validationErrors = useMemo(
    () => validateCategoryForm(formValues, categories, mode, selectedSlug),
    [categories, formValues, mode, selectedSlug],
  );
  const hasErrors = Object.keys(validationErrors).length > 0;

  function handleChange(
    field: keyof CategoryFormValues,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormValues((current) => ({ ...current, [field]: event.target.value }));
    setStatusMessage("");
  }

  function handleCreateMode() {
    setMode("create");
    setSelectedSlug("");
    setFormValues(emptyFormValues);
    setSubmitted(false);
    setStatusMessage("");
  }

  function handleEditMode(category: PotentialCategory) {
    setMode("edit");
    setSelectedSlug(category.slug);
    setFormValues(toFormValues(category));
    setSubmitted(false);
    setStatusMessage("");
  }

  function handleDeleteClick(category: PotentialCategory) {
    setDeleteTarget(category);
    setDeleteConfirmation("");
  }

  function handleCloseDeleteDialog() {
    setDeleteTarget(null);
    setDeleteConfirmation("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (hasErrors) {
      setStatusMessage("Periksa kembali field yang wajib diisi.");
      return;
    }

    setStatusMessage(
      mode === "create"
        ? "Kategori siap ditambahkan saat API tersedia."
        : "Perubahan kategori siap disimpan saat API tersedia.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Potensi Desa
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola kategori potensi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Halaman ini memakai data tiruan untuk menyusun pola pengelolaan
              kategori sebelum integrasi penyimpanan backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/potensi"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Kelola konten
            </Link>
            <Link
              href="/potensi"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat halaman publik
            </Link>
            <button
              type="button"
              onClick={handleCreateMode}
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Tambah kategori
            </button>
          </div>
        </div>
      </section>

      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 py-3">
          <Link
            href="/admin/potensi"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
          >
            Konten potensi
          </Link>
          <Link
            href="/admin/potensi/kategori"
            className="rounded-md bg-sage-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Kategori potensi
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.72fr_0.28fr] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard value={categories.length.toString()} label="Kategori" />
            <MetricCard
              value={totalGalleryItems.toString()}
              label="Foto galeri"
            />
            <MetricCard value={mode === "create" ? "Tambah" : "Edit"} label="Mode form" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daftar kategori</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Urutan ini mengikuti tampilan halaman publik Potensi Desa.
                </p>
              </div>
              <div className="rounded-md bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800">
                {categories.length} item aktif
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Slug</th>
                    <th className="px-5 py-3 font-semibold">Statistik</th>
                    <th className="px-5 py-3 font-semibold">Galeri</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.slug} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-950">
                          {category.label}
                        </div>
                        <div className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                          {category.title}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="rounded-md bg-stone-100 px-2 py-1 text-xs text-slate-700">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <strong className="block text-slate-950">
                          {category.stats.value}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {category.stats.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {category.gallery.length} foto
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Publik
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/potensi/${category.slug}`}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditMode(category)}
                            className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(category)}
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
                          >
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
        </div>

        <aside className="grid gap-5 self-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            noValidate
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === "create" ? "Form tambah kategori" : "Form edit kategori"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Validasi dilakukan di browser sebelum integrasi penyimpanan backend.
                </p>
              </div>
              <span className="rounded-md bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                {mode === "create" ? "Baru" : selectedSlug}
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <FormField
                label="Nama kategori"
                value={formValues.label}
                error={submitted ? validationErrors.label : undefined}
                onChange={(event) => handleChange("label", event)}
              />
              <FormField
                label="Slug"
                value={formValues.slug}
                error={submitted ? validationErrors.slug : undefined}
                onChange={(event) => handleChange("slug", event)}
              />
              <FormField
                label="Judul"
                value={formValues.title}
                error={submitted ? validationErrors.title : undefined}
                onChange={(event) => handleChange("title", event)}
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Ringkasan
                </label>
                <textarea
                  className={`mt-2 min-h-28 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700 ${
                    submitted && validationErrors.summary
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                  value={formValues.summary}
                  onChange={(event) => handleChange("summary", event)}
                />
                {submitted && validationErrors.summary ? (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {validationErrors.summary}
                  </p>
                ) : null}
              </div>
              {statusMessage ? (
                <p
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    submitted && hasErrors
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCreateMode}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
                >
                  {mode === "create" ? "Simpan kategori" : "Simpan perubahan"}
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Checklist konten</h2>
            <div className="mt-4 grid gap-3">
              <ChecklistItem label="Judul dan ringkasan terisi" />
              <ChecklistItem label="Slug memakai huruf kecil dan tanda hubung" />
              <ChecklistItem label="Slug tidak duplikat" />
              <ChecklistItem label="Preview halaman publik dicek" />
            </div>
          </div>
        </aside>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hapus-kategori-title"
            className="w-full max-w-md rounded-lg border border-red-100 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
                  Konfirmasi hapus
                </p>
                <h2
                  id="hapus-kategori-title"
                  className="mt-2 text-xl font-semibold text-slate-950"
                >
                  Hapus kategori {deleteTarget.label}?
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteDialog}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700"
                aria-label="Tutup dialog hapus kategori"
              >
                X
              </button>
            </div>

            <div className="mt-5 rounded-md border border-red-100 bg-red-50 p-4">
              <p className="text-sm leading-6 text-slate-700">
                Kategori ini memiliki {deleteTarget.gallery.length} foto galeri dan
                halaman publik <strong>/{deleteTarget.slug}</strong>. Pada fase
                frontend ini, tombol hapus hanya mensimulasikan konfirmasi.
              </p>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Ketik slug kategori untuk konfirmasi
              </label>
              <input
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-500"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder={deleteTarget.slug}
              />
              {deleteConfirmation && deleteConfirmation !== deleteTarget.slug ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Slug belum sesuai.
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteDialog}
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={deleteConfirmation !== deleteTarget.slug}
                className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-200"
              >
                Hapus kategori
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function toFormValues(category: PotentialCategory): CategoryFormValues {
  return {
    label: category.label,
    slug: category.slug,
    title: category.title,
    summary: category.summary,
  };
}

function validateCategoryForm(
  values: CategoryFormValues,
  categories: PotentialCategory[],
  mode: "create" | "edit",
  selectedSlug: string,
) {
  const errors: CategoryFormErrors = {};
  const normalizedSlug = values.slug.trim().toLowerCase();

  if (values.label.trim().length < 3) {
    errors.label = "Nama kategori minimal 3 karakter.";
  }

  if (!normalizedSlug) {
    errors.slug = "Slug wajib diisi.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    errors.slug = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
  } else if (
    categories.some((category) => {
      const isCurrentEdit = mode === "edit" && category.slug === selectedSlug;
      return !isCurrentEdit && category.slug === normalizedSlug;
    })
  ) {
    errors.slug = "Slug sudah dipakai kategori lain.";
  }

  if (values.title.trim().length < 8) {
    errors.title = "Judul minimal 8 karakter.";
  }

  if (values.summary.trim().length < 30) {
    errors.summary = "Ringkasan minimal 30 karakter.";
  }

  return errors;
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <strong className="block text-2xl font-semibold text-slate-950">
        {value}
      </strong>
      <span className="mt-1 block text-sm text-slate-500">{label}</span>
    </div>
  );
}

function FormField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        className={`mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={onChange}
      />
      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-stone-50 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-sage-700" />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}




