import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNavigation } from "@/components/admin-navigation";
import { listAdminNews } from "@/lib/admin-news-store";
import { listAdminStatistics } from "@/lib/admin-statistics-store";
import { listCategoryRecords } from "@/lib/potential-category-store";
import { listPotentialItems } from "@/lib/potential-item-store";
import { listGalleryAlbumRecords, listGalleryVideoRecords } from "@/lib/gallery-store";
import { listOfficialRecords } from "@/lib/profile-officials";
import { listTransparencyRecords } from "@/lib/transparency-store";
import { listVillageRegulationRecords } from "@/lib/village-regulation-store";

type AdminModule = {
  title: string;
  description: string;
  href: string;
  metric: string;
};

export async function AdminDashboardPage() {
  const [
    news,
    officials,
    statistics,
    potentialItems,
    potentialCategories,
    transparencyDocuments,
    villageRegulations,
    galleryAlbums,
    galleryVideos,
  ] = await Promise.all([
    listAdminNews(),
    Promise.resolve(listOfficialRecords()),
    listAdminStatistics(),
    listPotentialItems(),
    listCategoryRecords(),
    listTransparencyRecords(),
    listVillageRegulationRecords(),
    listGalleryAlbumRecords(),
    listGalleryVideoRecords(),
  ]);

  const totalDocuments = transparencyDocuments.length + villageRegulations.length;
  const publishedCount = countPublished(news) + countPublished(potentialItems) + countPublished(transparencyDocuments) + countPublished(villageRegulations) + countPublished(statistics.metrics);
  const draftCount = countDraft(news) + countDraft(potentialItems) + countDraft(transparencyDocuments) + countDraft(villageRegulations) + countDraft(statistics.metrics);
  const totalContent = news.length + officials.length + statistics.metrics.length + potentialItems.length + potentialCategories.length + totalDocuments + galleryAlbums.length + galleryVideos.length;
  const adminModules: AdminModule[] = [
    {
      title: "Homepage",
      description: "Kelola hero dan ringkasan profil yang tampil di beranda.",
      href: "/admin/homepage",
      metric: "2 blok",
    },
    {
      title: "Berita dan AI",
      description: "Kelola publikasi berita dan draft berbantuan AI.",
      href: "/admin/berita",
      metric: `${news.length} berita`,
    },
    {
      title: "Perangkat Desa",
      description: "Kelola nama, jabatan, bidang kerja, dan kontak perangkat.",
      href: "/admin/perangkat",
      metric: `${officials.length} perangkat`,
    },

    {
      title: "Statistik Desa",
      description: "Kelola indikator ringkasan dan grafik kependudukan.",
      href: "/admin/statistik",
      metric: `${statistics.metrics.length} indikator`,
    },
    {
      title: "Potensi Desa",
      description: "Atur kategori, item, foto, dan status konten potensi.",
      href: "/admin/potensi",
      metric: `${potentialItems.length} item`,
    },
    {
      title: "Kategori Potensi",
      description: "Kelola kelompok potensi yang tampil di halaman publik.",
      href: "/admin/potensi/kategori",
      metric: `${potentialCategories.length} kategori`,
    },
    {
      title: "Galeri",
      description: "Kelola album foto dan video kegiatan desa.",
      href: "/admin/galeri",
      metric: `${galleryAlbums.length}/${galleryVideos.length}`,
    },
    {
      title: "Transparansi",
      description: "Publikasikan dokumen anggaran dan informasi publik desa.",
      href: "/admin/transparansi",
      metric: `${transparencyDocuments.length} dokumen`,
    },
    {
      title: "Dokumen / Perdes",
      description: "Kelola Perdes, Perkades, dan dokumen hukum desa.",
      href: "/admin/dokumen",
      metric: `${villageRegulations.length} dokumen`,
    },
  ];
  const recentActivities = [
    `${news.length} berita tersedia di kanal publik/admin`,
    `${potentialItems.length} item potensi dan ${potentialCategories.length} kategori aktif`,
    `${galleryAlbums.length} album dan ${galleryVideos.length} video galeri terdata`,
    `${totalDocuments} dokumen transparansi/perdes siap dikelola`,
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-700">
              Admin Desa Keseneng
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Dasbor pengelolaan konten desa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Akses cepat untuk mengelola berita, profil, potensi, galeri, statistik, dan dokumen desa.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Lihat website publik
            </Link>
            <AdminLogoutButton />

          </div>
        </div>
      </section>
      <AdminNavigation activeHref="/admin" />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard value={adminModules.length.toString()} label="Modul aktif" />
            <MetricCard value={totalContent.toLocaleString("id-ID")} label="Konten terdata" />
            <MetricCard value={draftCount.toLocaleString("id-ID")} label="Draf/arsip" />
            <MetricCard value={publishedCount.toLocaleString("id-ID")} label="Publik" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {adminModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sage-700"
              >
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold leading-7">{module.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {module.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-800">
                    {module.metric}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="grid gap-5 self-start xl:sticky xl:top-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Aksi cepat</h2>
            <div className="mt-4 grid gap-3">
              <QuickAction href="/admin/berita" label="Kelola berita" />
              <QuickAction href="/admin/perangkat" label="Kelola perangkat" />
              <QuickAction href="/admin/homepage" label="Kelola homepage" />
              <QuickAction href="/admin/galeri" label="Kelola galeri" />
              <QuickAction href="/admin/dokumen" label="Kelola Perdes" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Aktivitas terbaru</h2>
            <div className="mt-4 grid gap-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity}
                  className="rounded-md bg-stone-50 px-3 py-2 text-sm text-slate-700"
                >
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function countPublished(items: Array<Record<string, unknown>>) {
  return items.filter((item) => {
    const status = String(item.status ?? "").toLowerCase();

    return status === "published" || status === "dipublikasikan" || status === "berlaku";
  }).length;
}

function countDraft(items: Array<Record<string, unknown>>) {
  return items.filter((item) => {
    const status = String(item.status ?? "").toLowerCase();

    return status === "draft" || status === "draf" || status === "archived" || status === "arsip";
  }).length;
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <strong className="block text-2xl font-semibold leading-none text-slate-950">
        {value}
      </strong>
      <span className="mt-2 block text-sm text-slate-500">{label}</span>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-11 items-center justify-between rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
    >
      <span>{label}</span>
      <span aria-hidden="true">&gt;</span>
    </Link>
  );
}















