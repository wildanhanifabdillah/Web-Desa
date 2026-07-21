import Link from "next/link";
import type { TransparencyDocument } from "@/lib/transparency";

type TransparencyDetailPageProps = {
  document: TransparencyDocument;
  relatedDocuments: TransparencyDocument[];
};

export function TransparencyDetailPage({
  document,
  relatedDocuments,
}: TransparencyDetailPageProps) {
  return (
    <main className="bg-stone-50 text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-14 pt-28 text-white sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(15,23,42,0.97),rgba(15,23,42,0.82)_52%,rgba(63,111,74,0.34))]" />
        <div className="mx-auto max-w-7xl">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-slate-200"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/transparansi" className="transition-colors hover:text-white">
              Transparansi
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Detail Dokumen</span>
          </nav>
          <div className="mt-8 max-w-4xl">
            <span className="inline-flex rounded-md bg-sage-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sage-800">
              {document.category}
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {document.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              {document.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-20">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <p className="section-kicker">Pratinjau PDF</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Tampilan awal dokumen
              </h2>
            </div>
            <span className="w-fit rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
              {document.fileType} / {document.fileSize}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-stone-100">
            {document.fileUrl ? (
              <iframe
                title={`Pratinjau PDF ${document.title}`}
                src={`${document.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
                className="h-[72vh] min-h-[560px] w-full bg-white"
              />
            ) : (
              <div className="p-4">
                <div className="mx-auto max-w-2xl rounded-md bg-white p-6 shadow-sm sm:p-8">
                  <div className="border-b border-slate-200 pb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Desa Keseneng Digital
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight text-slate-950">
                      {document.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-500">
                      Tahun {document.year} / {document.category}
                    </p>
                  </div>
                  <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
                    <p>{document.description}</p>
                    <p>
                      File PDF belum tersedia untuk dokumen ini. Ringkasan berikut ditampilkan sementara sampai admin mengunggah file resmi.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoBox label="Status" value={document.status} />
                    <InfoBox label="Publikasi" value={formatDate(document.publishedAt)} />
                    <InfoBox label="Format" value={document.fileType} />
                    <InfoBox label="Ukuran" value={document.fileSize} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        <aside className="grid gap-4 self-start lg:sticky lg:top-28">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Metadata
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <MetadataRow label="Kategori" value={document.category} />
              <MetadataRow label="Tahun" value={document.year.toString()} />
              <MetadataRow label="Status" value={document.status} />
              <MetadataRow label="File" value={`${document.fileType} / ${document.fileSize}`} />
            </dl>
            <div className="mt-5 grid gap-2">
              {document.fileUrl ? (
                <Link
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-sage-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
                >
                  Buka PDF
                </Link>
              ) : null}
              <Link
                href="/transparansi"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-sage-800"
              >
                Kembali ke Daftar
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Dokumen Lainnya
            </p>
            <div className="mt-4 grid gap-3">
              {relatedDocuments.map((item) => (
                <Link
                  key={item.id}
                  href={`/transparansi/${item.slug}`}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-stone-50 p-3">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <strong className="mt-2 block text-slate-950">{value}</strong>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-stone-50 p-3">
      <dt className="font-semibold text-slate-950">{label}</dt>
      <dd className="mt-1 text-slate-600">{value}</dd>
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


