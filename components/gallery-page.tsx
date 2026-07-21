import Link from "next/link";
import type { GalleryAlbum, GalleryVideo } from "@/lib/gallery";

type GalleryPageProps = {
  albums: GalleryAlbum[];
  videos: GalleryVideo[];
};

export function GalleryPage({ albums, videos }: GalleryPageProps) {
  const totalPhotos = albums.reduce((total, album) => total + album.photoCount, 0);

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78)_52%,rgba(63,111,74,0.36))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.5fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Galeri Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Album foto dan video kegiatan Desa Keseneng.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Dokumentasi visual kegiatan warga, potensi desa, pelayanan publik,
              dan agenda budaya disusun agar mudah dipindai oleh pengunjung.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={albums.length.toString()} label="album" />
            <HeroMetric value={totalPhotos.toString()} label="foto" />
            <HeroMetric value={videos.length.toString()} label="video" />
            <HeroMetric value="2026" label="periode" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="section-kicker">Album Foto</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Dokumentasi foto dikelompokkan berdasarkan kegiatan dan potensi desa.
          </h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/galeri/${album.slug}`}
              className="block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-sage-700"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${album.coverImage})` }}
                aria-hidden="true"
              />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-md bg-sage-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sage-800">
                    {album.category}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    {album.photoCount} foto
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
                  {album.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {album.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <time className="text-xs font-semibold text-slate-500">
                    Diperbarui {formatDate(album.updatedAt)}
                  </time>
                  <span className="text-xs font-semibold text-sage-800">
                    Buka album
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="section-kicker">Video Desa</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Cuplikan video untuk mengenalkan kegiatan dan cerita warga.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-stone-50 shadow-sm"
              >
                <div
                  className="relative h-52 bg-cover bg-center"
                  style={{ backgroundImage: `url(${video.thumbnail})` }}
                  aria-hidden="true"
                >
                  <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/90 px-2.5 py-1 text-xs font-semibold text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold leading-7 text-slate-950">
                    {video.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {video.description}
                  </p>
                  <time className="mt-5 block text-xs font-semibold text-slate-500">
                    {formatDate(video.publishedAt)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4">
      <strong className="block text-2xl font-semibold">{value}</strong>
      <span className="mt-1 block text-sm text-slate-200">{label}</span>
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


