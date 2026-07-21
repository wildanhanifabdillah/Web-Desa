"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PotentialCategory } from "@/lib/potential-categories";
import type { PotentialItemRecord } from "@/lib/potential-item-store";

type AdminPotentialsPageProps = {
  categories: PotentialCategory[];
  items: PotentialItemRecord[];
};

type PotentialItem = {
  id: string;
  title: string;
  category: PotentialCategory;
  summary: string;
  image: string;
  status: "Publik" | "Draft";
  updatedAt: string;
};

export function AdminPotentialsPage({ categories, items: potentialItems }: AdminPotentialsPageProps) {
  const [activeCategory, setActiveCategory] = useState("semua");
  const [mockPhotoName, setMockPhotoName] = useState("sawah-produktif.jpg");
  const [editingItemId, setEditingItemId] = useState("");
  const [deleteItem, setDeleteItem] = useState<PotentialItem | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const items = useMemo(() => potentialItems.flatMap((record) => {
    const category = categories.find((candidate) => candidate.slug === record.categorySlug);

    if (!category) {
      return [];
    }

    return [{
      id: record.id,
      title: record.title,
      category,
      summary: record.summary,
      image: record.image,
      status: record.status === "published" ? "Publik" : "Draft",
      updatedAt: new Date(record.updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }];
  }) satisfies PotentialItem[], [categories, potentialItems]);
  const filteredItems = activeCategory === "semua"
    ? items
    : items.filter((item) => item.category.slug === activeCategory);
  const activeCategoryLabel = activeCategory === "semua"
    ? "Semua kategori"
    : categories.find((category) => category.slug === activeCategory)?.label ?? "Kategori";
  const editingItem = items.find((item) => item.id === editingItemId);
  const editorCategory = editingItem?.category ?? categories[0];

  function openDeleteDialog(item: PotentialItem) {
    setDeleteItem(item);
    setDeleteText("");
  }

  function closeDeleteDialog() {
    setDeleteItem(null);
    setDeleteText("");
  }

  function showSuccess(message: string) {
    setNotice({ type: "success", message });
  }

  function showError(message: string) {
    setNotice({ type: "error", message });
  }

  const publishedCount = items.filter((item) => item.status === "Publik").length;
  const draftCount = items.length - publishedCount;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Potensi Desa
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola konten potensi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Kelola item potensi, foto, ringkasan, dan status publikasi yang
              nantinya terhubung ke halaman publik Potensi Desa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/potensi/kategori"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Kelola kategori
            </Link>
            <button
              type="button"
              onClick={() => setEditingItemId("")}
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Tambah potensi
            </button>
          </div>
        </div>
      </section>

      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 py-3">
          <Link
            href="/admin/potensi"
            className="rounded-md bg-sage-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Konten potensi
          </Link>
          <Link
            href="/admin/potensi/kategori"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
          >
            Kategori potensi
          </Link>
        </div>
      </nav>

      {notice ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div
            className={`mx-auto max-w-7xl rounded-md px-4 py-3 text-sm font-semibold ${
              notice.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {notice.message}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.7fr_0.3fr] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard value={items.length.toString()} label="Total konten" />
            <MetricCard value={publishedCount.toString()} label="Publik" />
            <MetricCard value={draftCount.toString()} label="Draft" />
            <MetricCard value={categories.length.toString()} label="Kategori" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daftar konten potensi</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Menampilkan {filteredItems.length} item untuk {activeCategoryLabel}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Semua"
                  active={activeCategory === "semua"}
                  onClick={() => setActiveCategory("semua")}
                />
                {categories.map((category) => (
                  <FilterChip
                    key={category.slug}
                    label={category.label}
                    active={activeCategory === category.slug}
                    onClick={() => setActiveCategory(category.slug)}
                  />
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 p-5 md:grid-cols-[8rem_1fr_auto] md:items-center"
                >
                  <div
                    className="h-28 rounded-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${item.category.accentClassName}`}
                      >
                        {item.category.label}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          item.status === "Publik"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.summary}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Diperbarui {item.updatedAt}
                    </p>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <Link
                      href={`/potensi/${item.category.slug}`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemId(item.id);
                        showSuccess(`Mode edit dibuka untuk ${item.title}.`);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog(item)}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-5 self-start">
          <div
            key={editingItem?.id ?? "create"}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {editingItem ? "Form edit potensi" : "Form tambah potensi"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload foto masih tiruan dan hanya menampilkan nama file di browser.
            </p>
            <div className="mt-5 grid gap-4">
              {editingItem ? (
                <div
                  className="h-32 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${editingItem.image})` }}
                  aria-hidden="true"
                />
              ) : null}
              <FormField
                label="Judul konten"
                value={editingItem?.title ?? "Hamparan sawah produktif"}
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Kategori
                </label>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue={editorCategory?.slug ?? "pertanian"}
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Upload foto tiruan
                </label>
                <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-stone-50 px-4 py-5 text-center transition-colors hover:border-sage-700 hover:bg-sage-50">
                  <span className="text-sm font-semibold text-slate-800">
                    Pilih atau tarik foto potensi
                  </span>
                  <span className="mt-1 text-xs leading-5 text-slate-500">
                    JPG, PNG, atau WEBP. File tidak diunggah ke server pada fase frontend.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setMockPhotoName(file.name);
                      }
                    }}
                  />
                </label>
                <div className="mt-2 rounded-md bg-sage-50 px-3 py-2 text-sm font-semibold text-sage-800">
                  File dipilih: {editingItem ? editingItem.image.split("/").pop() : mockPhotoName}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Ringkasan
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue={editingItem?.summary ?? "Area pertanian warga yang menjadi sumber pangan utama."}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (editingItem) {
                      setEditingItemId("");
                      showError("Edit potensi dibatalkan.");
                    } else {
                      showSuccess("Draft potensi tersimpan secara tiruan.");
                    }
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
                >
                  {editingItem ? "Batalkan edit" : "Simpan draft"}
                </button>
                <button
                  type="button"
                  onClick={() => showSuccess(editingItem ? "Perubahan potensi tersimpan secara tiruan." : "Potensi baru dipublikasikan secara tiruan.")}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
                >
                  {editingItem ? "Simpan perubahan" : "Publikasikan"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Alur kerja</h2>
            <div className="mt-4 grid gap-3">
              <WorkflowItem number="1" label="Pilih kategori potensi" />
              <WorkflowItem number="2" label="Lengkapi foto dan ringkasan" />
              <WorkflowItem number="3" label="Preview halaman publik" />
              <WorkflowItem number="4" label="Publikasikan konten" />
            </div>
          </div>
        </aside>
      </section>

      {deleteItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hapus-item-potensi-title"
            className="w-full max-w-md rounded-lg border border-red-100 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
                  Konfirmasi hapus
                </p>
                <h2
                  id="hapus-item-potensi-title"
                  className="mt-2 text-xl font-semibold text-slate-950"
                >
                  Hapus item {deleteItem.title}?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700"
                aria-label="Tutup dialog hapus item potensi"
              >
                X
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-md border border-red-100 bg-red-50 p-4">
              <div
                className="h-28 rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url(${deleteItem.image})` }}
                aria-hidden="true"
              />
              <p className="text-sm leading-6 text-slate-700">
                Item kategori <strong>{deleteItem.category.label}</strong> ini
                masih memakai dialog frontend tiruan dan belum menghapus data server.
              </p>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Ketik judul item untuk konfirmasi
              </label>
              <input
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-500"
                value={deleteText}
                onChange={(event) => setDeleteText(event.target.value)}
                placeholder={deleteItem.title}
              />
              {deleteText && deleteText !== deleteItem.title ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Judul belum sesuai.
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={deleteText !== deleteItem.title}
                onClick={() => {
                  showSuccess(`Item ${deleteItem.title} dihapus secara tiruan.`);
                  closeDeleteDialog();
                }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-200"
              >
                Hapus item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
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

function FilterChip({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-xs font-semibold ${
        active
          ? "bg-sage-700 text-white"
          : "border border-slate-300 text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>
      <input
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
        defaultValue={value}
      />
    </div>
  );
}

function WorkflowItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="grid grid-cols-[2.25rem_1fr] items-center gap-3 rounded-md bg-stone-50 px-3 py-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sage-100 text-sm font-semibold text-sage-800">
        {number}
      </span>
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}








