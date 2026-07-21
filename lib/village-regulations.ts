export type VillageRegulation = {
  id: string;
  slug: string;
  number: string;
  title: string;
  year: number;
  category: string;
  summary: string;
  fileUrl?: string;
  fileType: string;
  fileSize: string;
  enactedAt: string;
  status: "Berlaku" | "Arsip";
};

const villageRegulations: VillageRegulation[] = [
  {
    id: "perdes-01-2026",
    slug: "perdes-01-2026-apbdes",
    number: "01 Tahun 2026",
    title: "Peraturan Desa tentang APBDes Tahun Anggaran 2026",
    year: 2026,
    category: "Keuangan Desa",
    summary:
      "Dasar hukum pelaksanaan anggaran pendapatan dan belanja Desa Keseneng tahun 2026.",
    fileType: "PDF",
    fileSize: "1.4 MB",
    enactedAt: "2026-01-12T09:00:00+07:00",
    status: "Berlaku",
  },
  {
    id: "perdes-02-2026",
    slug: "perdes-02-2026-pengelolaan-aset",
    number: "02 Tahun 2026",
    title: "Peraturan Desa tentang Pengelolaan Aset Desa",
    year: 2026,
    category: "Aset Desa",
    summary:
      "Pedoman pendataan, pemanfaatan, pemeliharaan, dan pelaporan aset milik desa.",
    fileType: "PDF",
    fileSize: "980 KB",
    enactedAt: "2026-03-18T10:30:00+07:00",
    status: "Berlaku",
  },
  {
    id: "perdes-03-2026",
    slug: "perdes-03-2026-keterbukaan-informasi",
    number: "03 Tahun 2026",
    title: "Peraturan Desa tentang Keterbukaan Informasi Publik",
    year: 2026,
    category: "Informasi Publik",
    summary:
      "Ketentuan layanan informasi publik desa, daftar informasi, dan tata cara permohonan informasi.",
    fileType: "PDF",
    fileSize: "1.1 MB",
    enactedAt: "2026-05-22T13:00:00+07:00",
    status: "Berlaku",
  },
  {
    id: "perkades-01-2025",
    slug: "perkades-01-2025-pelayanan-administrasi",
    number: "01 Tahun 2025",
    title: "Peraturan Kepala Desa tentang Standar Pelayanan Administrasi",
    year: 2025,
    category: "Pelayanan",
    summary:
      "Standar alur pelayanan surat menyurat, waktu layanan, dan persyaratan administrasi warga.",
    fileType: "PDF",
    fileSize: "720 KB",
    enactedAt: "2025-08-14T08:30:00+07:00",
    status: "Berlaku",
  },
  {
    id: "perdes-04-2024",
    slug: "perdes-04-2024-rkpdes",
    number: "04 Tahun 2024",
    title: "Peraturan Desa tentang RKPDes Tahun 2025",
    year: 2024,
    category: "Perencanaan",
    summary:
      "Dokumen hukum perencanaan kerja tahunan desa sebagai dasar penyusunan anggaran tahun berikutnya.",
    fileType: "PDF",
    fileSize: "1.8 MB",
    enactedAt: "2024-12-20T09:15:00+07:00",
    status: "Arsip",
  },
];

export async function getVillageRegulations() {
  return villageRegulations;
}
export async function searchVillageRegulations({
  query,
  category,
  year,
  status,
  limit,
}: {
  query?: string | null;
  category?: string | null;
  year?: number | null;
  status?: VillageRegulation["status"] | null;
  limit?: number | null;
}) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();
  const normalizedStatus = status?.trim().toLowerCase();

  const filteredRegulations = villageRegulations.filter((regulation) => {
    const searchableContent = [
      regulation.title,
      regulation.number,
      regulation.category,
      regulation.status,
      regulation.summary,
      regulation.year.toString(),
    ]
      .join(" ")
      .toLowerCase();
    const matchQuery = normalizedQuery
      ? searchableContent.includes(normalizedQuery)
      : true;
    const matchCategory = normalizedCategory
      ? regulation.category.toLowerCase() === normalizedCategory
      : true;
    const matchYear = year ? regulation.year === year : true;
    const matchStatus = normalizedStatus
      ? regulation.status.toLowerCase() === normalizedStatus
      : true;

    return matchQuery && matchCategory && matchYear && matchStatus;
  });

  const limitedRegulations = limit && Number.isFinite(limit) && limit > 0
    ? filteredRegulations.slice(0, limit)
    : filteredRegulations;

  return {
    data: limitedRegulations,
    total: limitedRegulations.length,
    available: filteredRegulations.length,
    query: normalizedQuery ?? null,
    category: normalizedCategory ?? null,
    year: year ?? null,
    status: normalizedStatus ?? null,
    limit: limit ?? null,
  };
}
export async function getVillageRegulationBySlug(slug: string) {
  return villageRegulations.find((regulation) => regulation.slug === slug) ?? null;
}

export function createVillageRegulationDownload(regulation: VillageRegulation) {
  return [
    `Nomor: ${regulation.number}`,
    `Judul: ${regulation.title}`,
    `Kategori: ${regulation.category}`,
    `Tahun: ${regulation.year}`,
    `Status: ${regulation.status}`,
    `Tanggal Penetapan: ${regulation.enactedAt}`,
    `Jenis File: ${regulation.fileType}`,
    `Ukuran File: ${regulation.fileSize}`,
    "",
    regulation.summary,
  ].join("\n");
}



