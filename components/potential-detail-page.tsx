import Link from "next/link";
import { PotentialGalleryLightbox } from "@/components/potential-gallery-lightbox";
import type { PotentialCategory } from "@/lib/potential-categories";

type PotentialDetailPageProps = {
  category: PotentialCategory;
  nextCategory: PotentialCategory;
  previousCategory: PotentialCategory;
  relatedCategories: PotentialCategory[];
};

export function PotentialDetailPage({
  category,
  nextCategory,
  previousCategory,
  relatedCategories,
}: PotentialDetailPageProps) {
  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${category.image})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.8)_50%,rgba(63,111,74,0.38))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.46fr)] lg:items-end">
          <div className="max-w-4xl">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-white">
                Beranda
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/potensi" className="transition-colors hover:text-white">
                Potensi
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{category.label}</span>
            </nav>
            <p className="mt-6 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              {category.detail.eyebrow}
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {category.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              {category.detail.intro}
            </p>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <span
              className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${category.accentClassName}`}
            >
              {category.label}
            </span>
            <strong className="mt-5 block text-4xl font-semibold">
              {category.stats.value}
            </strong>
            <span className="mt-1 block text-sm text-slate-200">
              {category.stats.label}
            </span>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.42fr] lg:px-8 lg:py-24">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="section-kicker">Detail Potensi</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Arah pengembangan {category.label.toLowerCase()} Desa Keseneng.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            {category.detail.description}
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Peluang pengembangan
            </h3>
            <div className="mt-4 grid gap-3">
              {category.detail.opportunities.map((item, index) => (
                <div
                  key={item}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-md bg-stone-50 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sage-100 text-sm font-semibold text-sage-800">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Narahubung
            </p>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {category.detail.contact.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {category.detail.contact.role}
            </p>
            <div className="mt-4 break-all rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-slate-700">
              {category.detail.contact.email}
            </div>
          </div>
          <div className="grid gap-2">
            <Link
              href="/potensi"
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
            >
              Kembali ke Potensi
            </Link>
            <Link
              href={`/potensi#${category.slug}-galeri`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-sage-700 hover:text-sage-800"
            >
              Buka galeri kategori
            </Link>
          </div>
        </aside>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="section-kicker">Program Turunan</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Rencana konten yang bisa dikembangkan admin desa.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {category.detail.programs.map((program) => (
              <article
                key={program.title}
                className="rounded-lg border border-slate-200 bg-stone-50 p-5"
              >
                <h3 className="text-xl font-semibold text-slate-950">
                  {program.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {program.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="section-kicker text-sage-200">Galeri Detail</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
                Visual pendukung untuk potensi {category.label.toLowerCase()}.
              </h2>
            </div>
            <Link
              href={`/potensi#${category.slug}-galeri`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Lihat galeri halaman utama
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <PotentialGalleryLightbox
              items={category.gallery.map((item) => ({
                ...item,
                category: category.label,
              }))}
              imageClassName="h-56 bg-cover bg-center"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">Navigasi Potensi</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Pindah ke kategori sebelum atau sesudahnya.
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <NavigationCard label="Sebelumnya" category={previousCategory} />
          <NavigationCard label="Berikutnya" category={nextCategory} />
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="section-kicker">Kategori Lain</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Jelajahi potensi desa lainnya.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {relatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/potensi/${item.slug}`}
                className="min-w-0 rounded-lg border border-slate-200 bg-stone-50 p-5 shadow-sm transition-colors hover:border-sage-700"
              >
                <span
                  className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${item.accentClassName}`}
                >
                  {item.label}
                </span>
                <strong className="mt-4 block text-lg font-semibold text-slate-950">
                  {item.title}
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function NavigationCard({
  label,
  category,
}: {
  label: string;
  category: PotentialCategory;
}) {
  return (
    <Link
      href={`/potensi/${category.slug}`}
      className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-sage-700"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <strong className="mt-3 block break-words text-lg font-semibold text-slate-950 sm:text-xl">
        {category.title}
      </strong>
      <span className="mt-3 inline-flex rounded-md bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800">
        {category.label}
      </span>
    </Link>
  );
}

