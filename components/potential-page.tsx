import Link from "next/link";
import { PotentialGalleryLightbox } from "@/components/potential-gallery-lightbox";
import type { PotentialCategory } from "@/lib/potential-categories";

type PotentialPageProps = {
  categories: PotentialCategory[];
};

export function PotentialPage({ categories }: PotentialPageProps) {
  const totalHighlights = categories.reduce(
    (total, category) => total + category.highlights.length,
    0,
  );

  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.95),rgba(15,23,42,0.76)_50%,rgba(120,83,36,0.38))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.58fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Potensi Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Kategori potensi Desa Keseneng yang siap dikembangkan.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Jelajahi kelompok potensi unggulan desa mulai dari pertanian,
              kesenian, UMKM, sampai peternakan warga dalam susunan yang mudah
              dipindai.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={categories.length.toString()} label="kategori" />
            <HeroMetric value={totalHighlights.toString()} label="fokus potensi" />
            <HeroMetric value="6" label="dusun terhubung" />
            <HeroMetric value="2026" label="data awal" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">Daftar Kategori</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Potensi utama dikelompokkan agar warga dan pengunjung cepat
              menemukan informasi yang relevan.
            </h2>
          </div>
          <Link
            href="/berita"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
          >
            Lihat Kabar Desa
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {categories.map((category) => (
            <article
              id={category.slug}
              key={category.slug}
              className="scroll-mt-28 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-sage-700"
            >
              <div className="grid min-h-full sm:grid-cols-[0.9fr_1.1fr]">
                <div
                  className="min-h-56 bg-cover bg-center sm:min-h-full"
                  style={{ backgroundImage: `url(${category.image})` }}
                  aria-hidden="true"
                />
                <div className="flex min-h-[300px] min-w-0 flex-col p-5 sm:min-h-[320px] sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${category.accentClassName}`}
                    >
                      {category.label}
                    </span>
                    <div className="text-left sm:text-right">
                      <strong className="block text-2xl font-semibold text-slate-950">
                        {category.stats.value}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {category.stats.label}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {category.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {category.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/potensi/${category.slug}`}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
                    >
                      Buka detail
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PotentialGallerySection categories={categories} />

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="section-kicker">Pengembangan Potensi</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Setiap kategori disiapkan sebagai pintu masuk ke detail potensi
              desa berikutnya.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard value="Katalog" label="Produk dan layanan warga" />
            <SummaryCard value="Cerita" label="Narasi kegiatan lokal" />
            <SummaryCard value="Kontak" label="Arah pengelolaan admin" />
          </div>
        </div>
      </section>
    </main>
  );
}


function PotentialGallerySection({
  categories,
}: {
  categories: PotentialCategory[];
}) {
  return (
    <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker text-sage-200">Galeri Potensi</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
              Dokumentasi visual tiap kategori potensi Desa Keseneng.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Galeri ini memakai data tiruan agar pola tampilan foto, judul,
              dan deskripsi siap dipakai saat konten resmi dimasukkan.
            </p>
          </div>
          <div className="self-start rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur-md">
            {categories.reduce((total, category) => total + category.gallery.length, 0)} foto terdata
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          {categories.map((category) => (
            <div key={category.slug} className="scroll-mt-28" id={`${category.slug}-galeri`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${category.accentClassName}`}
                  >
                    {category.label}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                </div>
                <Link
                  href={`/potensi/${category.slug}`}
                  className="inline-flex h-10 items-center rounded-md border border-white/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Halaman detail
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <PotentialGalleryLightbox
                  items={category.gallery.map((item) => ({
                    ...item,
                    category: category.label,
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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

function SummaryCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-stone-50 p-5">
      <strong className="block text-lg font-semibold text-slate-950">
        {value}
      </strong>
      <span className="mt-2 block text-sm leading-6 text-slate-600">
        {label}
      </span>
    </div>
  );
}






