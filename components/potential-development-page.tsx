import Link from "next/link";

export function PotentialDevelopmentPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <section className="relative isolate flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-slate-950 px-4 pb-16 pt-32 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-20 bg-[url('/hero-section.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82)_52%,rgba(63,111,74,0.48))]" />

        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage-100 backdrop-blur-md">
            Potensi Desa
          </p>
          <h1 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Halaman potensi sedang dalam pengembangan.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
            Informasi potensi Desa Keseneng sedang disusun agar data yang
            ditampilkan lebih rapi, lengkap, dan mudah dipahami warga.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sage-50"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/berita"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Lihat Berita Desa
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
