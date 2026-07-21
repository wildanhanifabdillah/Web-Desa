import Link from "next/link";
import type { ProfileOfficialRecord } from "@/lib/profile-officials";

type AdminOfficialsPageProps = {
  officials: ProfileOfficialRecord[];
};

const adminNavigationItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Konten umum", href: "/admin/konten" },
  { label: "Perangkat desa", href: "/admin/perangkat", active: true },
  { label: "Statistik", href: "/admin/statistik" },
  { label: "Potensi", href: "/admin/potensi" },
  { label: "Transparansi", href: "/admin/transparansi" },
];

export function AdminOfficialsPage({ officials }: AdminOfficialsPageProps) {
  const areas = Array.from(new Set(officials.map((official) => official.area)));
  const mainOfficial = officials.find((official) => official.displayOrder === 1);
  const latestUpdate = officials
    .map((official) => new Date(official.updatedAt))
    .sort((left, right) => right.getTime() - left.getTime())[0];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Perangkat Desa
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola data perangkat desa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Atur nama, jabatan, bidang kerja, kontak, dan urutan tampil
              perangkat desa sebelum tersambung penyimpanan backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profil"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat profil publik
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Tambah perangkat
            </button>
          </div>
        </div>
      </section>

      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-3">
          {adminNavigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ${
                item.active
                  ? "bg-sage-700 text-white"
                  : "border border-slate-300 text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.72fr_0.28fr] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard value={officials.length.toString()} label="Perangkat" />
            <MetricCard value={areas.length.toString()} label="Bidang kerja" />
            <MetricCard value={mainOfficial?.name ?? "-"} label="Kepala desa" compact />
            <MetricCard
              value={latestUpdate ? latestUpdate.toLocaleDateString("id-ID") : "-"}
              label="Update terakhir"
              compact
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daftar perangkat desa</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Urutan mengikuti tampilan struktur perangkat di halaman profil publik.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {areas.slice(0, 4).map((area) => (
                  <span
                    key={area}
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Urutan</th>
                    <th className="px-5 py-3 font-semibold">Nama</th>
                    <th className="px-5 py-3 font-semibold">Jabatan</th>
                    <th className="px-5 py-3 font-semibold">Bidang</th>
                    <th className="px-5 py-3 font-semibold">Kontak</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {officials.map((official) => (
                    <tr key={official.id} className="align-top">
                      <td className="px-5 py-4 text-slate-600">
                        #{official.displayOrder}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-950">
                          {official.name}
                        </div>
                        <p className="mt-1 max-w-sm leading-6 text-slate-500">
                          {official.focus}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {official.role}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                          {official.area}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {official.contact}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link
                            href="/profil"
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
            <h2 className="text-lg font-semibold">Editor perangkat</h2>
            <div className="mt-5 grid gap-4">
              <FormField label="Nama lengkap" value="Mugiharto, S.IP" />
              <FormField label="Jabatan" value="Kepala Desa" />
              <FormField label="Bidang kerja" value="Pemerintahan" />
              <FormField label="Kontak" value="kades@keseneng.desa.id" />
              <FormField label="Urutan tampil" value="1" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Fokus tugas
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Koordinasi pemerintahan dan arah pembangunan desa"
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
            <h2 className="text-lg font-semibold">Checklist perangkat</h2>
            <div className="mt-4 grid gap-3">
              <ChecklistItem label="Nama dan jabatan terisi" />
              <ChecklistItem label="Bidang kerja sesuai struktur" />
              <ChecklistItem label="Urutan tampil tidak bentrok" />
              <ChecklistItem label="Preview profil publik dicek" />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function MetricCard({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <strong
        className={`block font-semibold text-slate-950 ${
          compact ? "text-lg leading-7" : "text-2xl"
        }`}
      >
        {value}
      </strong>
      <span className="mt-1 block text-sm text-slate-500">{label}</span>
    </div>
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
