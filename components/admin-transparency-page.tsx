import Link from "next/link";
import type { TransparencyDocument } from "@/lib/transparency";

type AdminTransparencyPageProps = {
  documents: TransparencyDocument[];
};

export function AdminTransparencyPage({ documents }: AdminTransparencyPageProps) {
  const publishedCount = documents.filter(
    (document) => document.status === "Dipublikasikan",
  ).length;
  const draftCount = documents.length - publishedCount;
  const categories = Array.from(new Set(documents.map((item) => item.category)));

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Transparansi Desa
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola dokumen transparansi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Kelola dokumen anggaran, realisasi, perencanaan, dan informasi
              publik sebelum integrasi penyimpanan backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/transparansi"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat halaman publik
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Tambah dokumen
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.72fr_0.28fr] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard value={documents.length.toString()} label="Total dokumen" />
            <MetricCard value={publishedCount.toString()} label="Dipublikasikan" />
            <MetricCard value={draftCount.toString()} label="Draf" />
            <MetricCard value={categories.length.toString()} label="Kategori" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daftar dokumen</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Data tiruan berikut merepresentasikan dokumen yang dikelola admin.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Semua" active />
                <FilterChip label="Publik" />
                <FilterChip label="Draf" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[860px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Dokumen</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Tahun</th>
                    <th className="px-5 py-3 font-semibold">File</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((document) => (
                    <tr key={document.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-950">
                          {document.title}
                        </div>
                        <div className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                          {document.description}
                        </div>
                        <code className="mt-2 inline-block rounded-md bg-stone-100 px-2 py-1 text-xs text-slate-700">
                          {document.slug}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {document.category}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {document.year}
                      </td>
                      <td className="px-5 py-4">
                        <strong className="block text-slate-950">
                          {document.fileType}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {document.fileSize}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            document.status === "Dipublikasikan"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {document.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/transparansi/${document.slug}`}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Edit
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
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Editor dokumen</h2>
            <div className="mt-5 grid gap-4">
              <FormField label="Judul dokumen" value="Ringkasan APBDes Tahun 2026" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Kategori
                </label>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Anggaran"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <FormField label="Tahun" value="2026" />
              <FormField label="Nama file" value="apbdes-2026.pdf" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Deskripsi
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Ringkasan pendapatan, belanja, dan pembiayaan desa."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
                >
                  Simpan draf
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
                >
                  Publikasikan
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Checklist dokumen</h2>
            <div className="mt-4 grid gap-3">
              <ChecklistItem label="Judul dan kategori terisi" />
              <ChecklistItem label="File dokumen tersedia" />
              <ChecklistItem label="Tahun publikasi benar" />
              <ChecklistItem label="Preview halaman publik dicek" />
            </div>
          </div>
        </aside>
      </section>
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

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
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

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-stone-50 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-sage-700" />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}
