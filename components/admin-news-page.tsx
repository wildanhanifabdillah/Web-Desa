import Link from "next/link";
import type { LatestNewsItem } from "@/lib/latest-news";

type AdminNewsPageProps = {
  news: LatestNewsItem[];
};

const adminNavigationItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Konten umum", href: "/admin/konten" },
  { label: "Perangkat desa", href: "/admin/perangkat" },
  { label: "Berita & AI", href: "/admin/berita", active: true },
  { label: "Statistik", href: "/admin/statistik" },
  { label: "Potensi", href: "/admin/potensi" },
  { label: "Transparansi", href: "/admin/transparansi" },
];

export function AdminNewsPage({ news }: AdminNewsPageProps) {
  const categories = Array.from(new Set(news.map((item) => item.category)));
  const aiDraftCount = Math.ceil(news.length / 3);
  const publishedCount = news.length - 2;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Berita dan AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Kelola berita desa dan draft AI
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tinjau berita, susun ringkasan, dan siapkan draft berbantuan AI
              dengan data tiruan sebelum tersambung layanan backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/berita"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat berita publik
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Buat berita baru
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
            <MetricCard value={news.length.toString()} label="Total berita" />
            <MetricCard value={publishedCount.toString()} label="Publik" />
            <MetricCard value="2" label="Draf" />
            <MetricCard value={aiDraftCount.toString()} label="Draft AI" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Daftar berita</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Berita publik dan draft yang siap ditinjau admin desa.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((category) => (
                  <span
                    key={category}
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {news.map((item, index) => {
                const isAiDraft = index % 3 === 0;
                const status = index > news.length - 3 ? "Draf" : "Publik";

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                          {item.category}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            status === "Publik"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {status}
                        </span>
                        {isAiDraft ? (
                          <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            Draft AI
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                        {item.excerpt}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(item.publishedAt)} / {item.authorName}
                      </p>
                    </div>
                    <div className="flex gap-2 lg:flex-col">
                      <Link
                        href={`/berita/${item.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800"
                      >
                        Preview
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="grid gap-5 self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Asisten AI berita</h2>
            <div className="mt-5 grid gap-4">
              <FormField label="Topik kegiatan" value="Musyawarah program pertanian" />
              <FormField label="Kategori" value="Pertanian" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Arahan draft AI
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sage-700"
                  defaultValue="Buat ringkasan berita informatif untuk warga dengan gaya resmi dan mudah dipahami."
                />
              </div>
              <div className="rounded-md border border-sky-100 bg-sky-50 p-3 text-sm leading-6 text-sky-800">
                Draft AI tiruan: Pemerintah desa menyiapkan musyawarah untuk
                memetakan program pertanian prioritas warga.
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
                  Buat draft AI
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Editor berita</h2>
            <div className="mt-5 grid gap-4">
              <FormField label="Judul" value="Warga Desa Keseneng Rawat Tradisi Gotong Royong Panen" />
              <FormField label="Slug" value="warga-desa-keseneng-rawat-tradisi-gotong-royong-panen" />
              <FormField label="Penulis" value="Admin Desa Keseneng" />
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Simpan perubahan
              </button>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
