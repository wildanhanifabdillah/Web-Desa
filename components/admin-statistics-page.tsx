import Link from "next/link";
import type { StatisticMetric, StatisticSection } from "@/lib/statistics";

type AdminStatisticsPageProps = {
  overview: StatisticMetric[];
  sections: StatisticSection[];
};

export function AdminStatisticsPage({
  overview,
  sections,
}: AdminStatisticsPageProps) {
  const totalIndicators = overview.length;
  const totalSections = sections.length;
  const totalChartItems = sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const populationMetric = overview.find((metric) => metric.id === "penduduk");

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Statistik Desa
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola data statistik desa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Atur angka ringkasan, kategori grafik, dan data pembanding untuk
              halaman statistik publik dengan data tiruan yang siap diganti API.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/statistik"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat halaman publik
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Tambah statistik
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.72fr_0.28fr] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard
              value={populationMetric?.value.toLocaleString("id-ID") ?? "0"}
              label="Total penduduk"
            />
            <MetricCard
              value={totalIndicators.toString()}
              label="Indikator utama"
            />
            <MetricCard value={totalSections.toString()} label="Kategori grafik" />
            <MetricCard value={totalChartItems.toString()} label="Baris data" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Indikator ringkasan</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Angka utama yang tampil pada halaman statistik desa.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip label="Semua" active />
                <FilterChip label="Publik" />
                <FilterChip label="Draf" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[820px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Indikator</th>
                    <th className="px-5 py-3 font-semibold">Nilai</th>
                    <th className="px-5 py-3 font-semibold">Satuan</th>
                    <th className="px-5 py-3 font-semibold">Deskripsi</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.map((metric) => (
                    <tr key={metric.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-950">
                          {metric.label}
                        </div>
                        <code className="mt-2 inline-block rounded-md bg-stone-100 px-2 py-1 text-xs text-slate-700">
                          {metric.id}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-lg font-semibold text-slate-950">
                        {metric.value.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{metric.unit}</td>
                      <td className="px-5 py-4">
                        <p className="max-w-md leading-6 text-slate-500">
                          {metric.description}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href="/statistik"
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
                          >
                            Preview
                          </Link>
                          <a
                            href="#edit-statistik"
                            className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Edit
                          </a>
                          <a
                            href="#hapus-statistik"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
                          >
                            Hapus
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{section.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {section.totalLabel}
                    </p>
                  </div>
                  <span className="rounded-md bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                    {section.items.length} item
                  </span>
                </div>
                <strong className="mt-4 block text-2xl font-semibold text-slate-950">
                  {section.totalValue.toLocaleString("id-ID")} {section.unit}
                </strong>
                <p className="mt-3 min-h-20 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
                <div className="mt-4 grid gap-3">
                  {section.items.map((item) => {
                    const width = Math.max(
                      8,
                      Math.round((item.value / section.totalValue) * 100),
                    );

                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-slate-700">
                            {item.label}
                          </span>
                          <span className="text-slate-500">
                            {item.value.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${item.colorClassName}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-5 self-start">
          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Form tambah data statistik
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Tambahkan indikator ringkasan atau item grafik baru.
                </p>
              </div>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Draf
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Tipe data
                </label>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="overview"
                >
                  <option value="overview">Indikator ringkasan</option>
                  <option value="chart-item">Item grafik kategori</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Kategori grafik
                </label>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue={sections[0]?.id}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <FormField label="Nama data" value="Penduduk produktif" />
              <FormField label="Nilai" value="1845" />
              <FormField label="Satuan" value="jiwa" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Warna grafik
                </label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <ColorOption label="Sage" className="bg-sage-600" active />
                  <ColorOption label="Hijau" className="bg-emerald-500" />
                  <ColorOption label="Biru" className="bg-sky-500" />
                  <ColorOption label="Kuning" className="bg-amber-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Deskripsi
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Jumlah warga pada rentang usia produktif yang menjadi basis program ekonomi desa."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Status publikasi
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-md border border-sage-700 bg-sage-50 px-3 py-2 text-sm font-semibold text-sage-800">
                    <input type="radio" name="status" defaultChecked />
                    Publik
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                    <input type="radio" name="status" />
                    Draf
                  </label>
                </div>
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
          </form>

          <form
            id="edit-statistik"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Edit data terpilih</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Contoh mode edit untuk data yang sudah ada sebelum tersambung API.
                </p>
              </div>
              <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                penduduk
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  ID data
                </label>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-stone-50 px-3 text-sm text-slate-500"
                  defaultValue="penduduk"
                  readOnly
                />
              </div>
              <FormField label="Nama indikator" value="Penduduk" />
              <FormField label="Nilai terbaru" value="4210" />
              <FormField label="Satuan" value="jiwa" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Kategori data
                </label>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="overview"
                >
                  <option value="overview">Indikator ringkasan</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Catatan perubahan
                </label>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Perbarui angka setelah rekapitulasi data kependudukan terbaru."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Perbarui data
                </button>
              </div>
            </div>
          </form>
          <form
            id="hapus-statistik"
            className="rounded-lg border border-red-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-red-700">
                  Hapus data statistik
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Konfirmasi penghapusan data sebelum benar-benar dihapus dari
                  daftar statistik.
                </p>
              </div>
              <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                Risiko
              </span>
            </div>

            <div className="mt-5 rounded-md border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                Data yang dipilih
              </p>
              <strong className="mt-2 block text-base text-slate-950">
                Penduduk - 4.210 jiwa
              </strong>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Data ini digunakan sebagai indikator ringkasan di halaman publik
                statistik desa.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Ketik HAPUS untuk konfirmasi
                </label>
                <input
                  className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-red-500"
                  placeholder="HAPUS"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Hapus data
                </button>
              </div>
            </div>
          </form>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Checklist statistik</h2>
            <div className="mt-4 grid gap-3">
              <ChecklistItem label="Nilai dan satuan sudah valid" />
              <ChecklistItem label="Kategori grafik dipilih" />
              <ChecklistItem label="Deskripsi mudah dipahami warga" />
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

function ColorOption({
  label,
  className,
  active = false,
}: {
  label: string;
  className: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex h-10 items-center justify-center rounded-md border text-xs font-semibold ${
        active
          ? "border-sage-700 bg-sage-50 text-sage-800"
          : "border-slate-300 text-slate-700"
      }`}
    >
      <span className={`mr-2 h-3 w-3 rounded-full ${className}`} />
      {label}
    </button>
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




