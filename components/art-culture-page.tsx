import type { ReactNode } from "react";
import Link from "next/link";
import type { ArtGroupRecord, ArtTypeRecord } from "@/lib/art-culture-store";

type ArtCultureGroup = ArtGroupRecord & {
  artTypes: ArtTypeRecord[];
};

type ArtCulturePageProps = {
  types: ArtTypeRecord[];
  groups: ArtCultureGroup[];
};

export function ArtCulturePage({ types, groups }: ArtCulturePageProps) {
  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.76)_50%,rgba(63,111,74,0.42))]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.46fr)] lg:items-end">
          <div className="max-w-4xl">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-white">Beranda</Link>
              <span aria-hidden="true">/</span>
              <Link href="/potensi" className="transition-colors hover:text-white">Potensi</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">Seni & Budaya</span>
            </nav>
            <p className="mt-6 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
              Potensi Desa
            </p>
            <h1 className="mt-8 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Seni & Budaya Desa Keseneng.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              Dokumentasi jenis kesenian dan paguyuban aktif yang dikelola warga Keseneng sebagai identitas budaya desa.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:p-4">
            <HeroMetric value={types.length.toString()} label="jenis seni" />
            <HeroMetric value={groups.length.toString()} label="kelompok aktif" />
            <HeroMetric value={getTotalMembers(groups).toLocaleString("id-ID")} label="anggota" />
            <HeroMetric value="Admin" label="sumber data" />
          </div>
        </div>
      </section>

      <nav className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8" aria-label="Navigasi Seni Budaya">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          <AnchorLink href="#jenis-kesenian">Jenis Kesenian</AnchorLink>
          <AnchorLink href="#kelompok-seni">Kelompok Seni</AnchorLink>
          {types.map((type) => <AnchorLink key={type.id} href={`#${type.slug}`}>{type.name}</AnchorLink>)}
        </div>
      </nav>

      <section id="jenis-kesenian" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="section-kicker">Jenis Kesenian</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            Dua kesenian utama yang menjadi wajah budaya Keseneng.
          </h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {types.map((type) => (
            <article id={type.slug} key={type.id} className="scroll-mt-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid sm:grid-cols-[0.8fr_1.2fr]">
                <div className="min-h-56 bg-cover bg-center" style={{ backgroundImage: `url(${type.imageUrl})` }} aria-label={type.imageAlt} />
                <div className="p-5 sm:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">Kesenian</span>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">{type.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{type.summary}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{type.description}</p>
                  {type.history ? <p className="mt-4 rounded-md bg-stone-50 p-4 text-sm leading-7 text-slate-600">{type.history}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="kelompok-seni" className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="section-kicker">Kelompok Seni Aktif</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Paguyuban seni yang menjaga latihan, pertunjukan, dan regenerasi.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {groups.map((group) => (
              <article key={group.id} className="overflow-hidden rounded-lg border border-slate-200 bg-stone-50 shadow-sm">
                <div className="h-52 bg-cover bg-center" style={{ backgroundImage: `url(${group.imageUrl})` }} aria-label={group.imageAlt} />
                <div className="p-5">
                  <h3 className="text-2xl font-semibold text-slate-950">{group.name}</h3>
                  <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-950">Anggota</dt>
                      <dd className="mt-1">{group.memberCount.toLocaleString("id-ID")} orang</dd>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-950">Tarif</dt>
                      <dd className="mt-1">{formatTariff(group.tariffMin, group.tariffMax)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{group.foundedHistory}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{group.performanceManagement}</p>
                  {group.contactName || group.contactPhone ? (
                    <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
                      <strong className="block text-slate-950">{group.contactName || "Narahubung"}</strong>
                      {group.contactPhone ? <span className="mt-1 block break-all">{group.contactPhone}</span> : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AnchorLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800">
      {children}
    </Link>
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

function getTotalMembers(groups: ArtCultureGroup[]) {
  return groups.reduce((total, group) => total + group.memberCount, 0);
}

function formatTariff(min: number, max: number) {
  if (min <= 0 && max <= 0) {
    return "Menyesuaikan acara";
  }

  if (max <= min) {
    return formatCurrency(min);
  }

  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}