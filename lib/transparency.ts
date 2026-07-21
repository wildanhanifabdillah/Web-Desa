export type TransparencyDocument = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  fileType: string;
  fileSize: string;
  fileUrl?: string;
  publishedAt: string;
  status: "Dipublikasikan" | "Draf";
};

const transparencyDocuments: TransparencyDocument[] = [
  {
    id: "apbdes-2026",
    slug: "ringkasan-apbdes-2026",
    title: "Ringkasan APBDes Tahun 2026",
    category: "Anggaran",
    year: 2026,
    description:
      "Ringkasan pendapatan, belanja, dan pembiayaan desa sebagai informasi awal keterbukaan anggaran.",
    fileType: "PDF",
    fileSize: "1.2 MB",
    publishedAt: "2026-01-15T09:00:00+07:00",
    status: "Dipublikasikan",
  },
  {
    id: "realisasi-semester-1-2026",
    slug: "realisasi-anggaran-semester-1-2026",
    title: "Realisasi Anggaran Semester I 2026",
    category: "Realisasi",
    year: 2026,
    description:
      "Laporan perkembangan realisasi kegiatan dan anggaran desa pada semester pertama.",
    fileType: "PDF",
    fileSize: "980 KB",
    publishedAt: "2026-07-05T10:00:00+07:00",
    status: "Dipublikasikan",
  },
  {
    id: "rkpdes-2026",
    slug: "rkpdes-2026",
    title: "RKPDes Tahun 2026",
    category: "Perencanaan",
    year: 2026,
    description:
      "Dokumen rencana kerja pemerintah desa yang memuat arah program prioritas tahunan.",
    fileType: "PDF",
    fileSize: "1.6 MB",
    publishedAt: "2026-01-08T08:30:00+07:00",
    status: "Dipublikasikan",
  },
  {
    id: "daftar-informasi-publik",
    slug: "daftar-informasi-publik-desa",
    title: "Daftar Informasi Publik Desa",
    category: "Informasi Publik",
    year: 2026,
    description:
      "Daftar informasi yang tersedia untuk warga dan pengunjung sebagai rujukan layanan publik desa.",
    fileType: "XLSX",
    fileSize: "420 KB",
    publishedAt: "2026-02-20T13:00:00+07:00",
    status: "Dipublikasikan",
  },
  {
    id: "laporan-kegiatan-pembangunan",
    slug: "laporan-kegiatan-pembangunan-desa",
    title: "Laporan Kegiatan Pembangunan Desa",
    category: "Pembangunan",
    year: 2025,
    description:
      "Dokumentasi ringkas program pembangunan fisik dan nonfisik yang telah dilaksanakan desa.",
    fileType: "PDF",
    fileSize: "2.1 MB",
    publishedAt: "2025-12-28T15:30:00+07:00",
    status: "Dipublikasikan",
  },
  {
    id: "laporan-aset-desa",
    slug: "laporan-aset-desa",
    title: "Laporan Aset Desa",
    category: "Aset",
    year: 2025,
    description:
      "Daftar aset dan inventaris desa untuk mendukung tata kelola administrasi yang tertib.",
    fileType: "PDF",
    fileSize: "760 KB",
    publishedAt: "2025-12-10T11:15:00+07:00",
    status: "Dipublikasikan",
  },
];

export async function getTransparencyDocuments() {
  return transparencyDocuments;
}

export async function getTransparencyDocumentBySlug(slug: string) {
  return transparencyDocuments.find((document) => document.slug === slug) ?? null;
}
export async function searchTransparencyDocuments({
  category,
  year,
  status,
  limit,
}: {
  category?: string | null;
  year?: number | null;
  status?: TransparencyDocument["status"] | null;
  limit?: number | null;
}) {
  const normalizedCategory = category?.trim().toLowerCase();
  const normalizedStatus = status?.trim().toLowerCase();

  const filteredDocuments = transparencyDocuments.filter((document) => {
    const matchCategory = normalizedCategory
      ? document.category.toLowerCase() === normalizedCategory
      : true;
    const matchYear = year ? document.year === year : true;
    const matchStatus = normalizedStatus
      ? document.status.toLowerCase() === normalizedStatus
      : true;

    return matchCategory && matchYear && matchStatus;
  });

  const limitedDocuments = limit && Number.isFinite(limit) && limit > 0
    ? filteredDocuments.slice(0, limit)
    : filteredDocuments;

  return {
    data: limitedDocuments,
    total: limitedDocuments.length,
    available: filteredDocuments.length,
    category: normalizedCategory ?? null,
    year: year ?? null,
    status: normalizedStatus ?? null,
    limit: limit ?? null,
  };
}
export function createTransparencyDocumentDownload(document: TransparencyDocument) {
  return [
    `Judul: ${document.title}`,
    `Kategori: ${document.category}`,
    `Tahun: ${document.year}`,
    `Status: ${document.status}`,
    `Tanggal Publikasi: ${document.publishedAt}`,
    `Jenis File: ${document.fileType}`,
    `Ukuran File: ${document.fileSize}`,
    "",
    document.description,
  ].join("\n");
}
