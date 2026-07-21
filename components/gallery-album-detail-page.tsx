import Link from "next/link";
import type { GalleryAlbum } from "@/lib/gallery";

type GalleryAlbumDetailPageProps = {
  album: GalleryAlbum;
  relatedAlbums: GalleryAlbum[];
};

export function GalleryAlbumDetailPage({
  album,
  relatedAlbums,
}: GalleryAlbumDetailPageProps) {
  const featuredPhoto = album.photos[0];

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${album.coverImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.8)_52%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto max-w-7xl">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-slate-200"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/galeri" className="transition-colors hover:text-white">
              Galeri
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Album</span>
          </nav>
          <div className="mt-8 max-w-4xl">
            <span className="inline-flex rounded-md bg-sage-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sage-800">
              {album.category}
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {album.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              {album.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-20">
        <div>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-kicker">Grid Foto</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Foto pilihan dari album {album.category.toLowerCase()}.
              </h2>
            </div>
            <Link
              href="/galeri"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Kembali ke Galeri
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {album.photos.map((photo) => (
              <a
                key={photo.id}
                href={`#${photo.id}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-sage-700"
              >
                <div
                  className="h-52 bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo.image})` }}
                  aria-hidden="true"
                />
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-950">
                    {photo.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {photo.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <aside className="grid gap-4 self-start lg:sticky lg:top-28">
          {featuredPhoto ? (
            <div
              id={featuredPhoto.id}
              className="scroll-mt-28 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${featuredPhoto.image})` }}
                aria-hidden="true"
              />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Detail Foto
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  {featuredPhoto.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {featuredPhoto.description}
                </p>
                <time className="mt-4 block text-xs font-semibold text-slate-500">
                  {formatDate(featuredPhoto.takenAt)}
                </time>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Album Lainnya
            </p>
            <div className="mt-4 grid gap-3">
              {relatedAlbums.map((item) => (
                <Link
                  key={item.id}
                  href={`/galeri/${item.slug}`}
                  className="rounded-md bg-stone-50 p-3 transition-colors hover:bg-sage-50"
                >
                  <span className="text-xs font-semibold text-sage-800">
                    {item.category}
                  </span>
                  <strong className="mt-2 block text-sm leading-6 text-slate-950">
                    {item.title}
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
