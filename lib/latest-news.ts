export type LatestNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
  authorName: string;
};

const fallbackLatestNews: LatestNewsItem[] = [
  {
    id: "1b3f4e8c-5e2a-46f6-bb25-0be4c7c8d901",
    title: "Warga Desa Keseneng Rawat Tradisi Gotong Royong Panen",
    slug: "warga-desa-keseneng-rawat-tradisi-gotong-royong-panen",
    excerpt:
      "Kegiatan panen bersama menjadi ruang warga memperkuat kerja sama sekaligus menjaga produktivitas lahan pertanian desa.",
    category: "Pertanian",
    imageUrl: "/images/berita/gotong-royong-panen.jpg",
    imageAlt: "Warga Desa Keseneng bergotong royong saat kegiatan panen",
    publishedAt: "2026-07-01T08:00:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "d8c2c8b7-a7d4-4d79-9f52-5e0f3439bb12",
    title: "Kelompok Seni Desa Siapkan Pentas Budaya Tahunan",
    slug: "kelompok-seni-desa-siapkan-pentas-budaya-tahunan",
    excerpt:
      "Latihan rutin kelompok seni desa terus dilakukan sebagai persiapan pentas budaya yang melibatkan generasi muda.",
    category: "Kesenian",
    imageUrl: "/images/berita/pentas-budaya.jpg",
    imageAlt: "Kelompok seni Desa Keseneng berlatih untuk pentas budaya",
    publishedAt: "2026-06-24T09:00:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "a64e2735-3a4e-4d97-908a-ec4f21ad7306",
    title: "Pemerintah Desa Buka Akses Informasi Publik Digital",
    slug: "pemerintah-desa-buka-akses-informasi-publik-digital",
    excerpt:
      "Informasi desa, dokumen publik, dan kabar kegiatan disiapkan agar warga lebih mudah mengikuti perkembangan desa.",
    category: "Informasi Publik",
    imageUrl: "/images/berita/informasi-publik.jpg",
    imageAlt: "Perangkat Desa Keseneng menyiapkan informasi publik digital",
    publishedAt: "2026-06-18T10:00:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "6a4d2b9d-3277-4c38-ae6f-7e9cf3f0b815",
    title: "Posyandu Balita dan Lansia Digelar di Balai Desa",
    slug: "posyandu-balita-dan-lansia-digelar-di-balai-desa",
    excerpt:
      "Kader kesehatan desa bersama bidan wilayah melayani pemeriksaan rutin, penimbangan balita, dan edukasi gizi keluarga.",
    category: "Kesehatan",
    imageUrl: "/images/berita/posyandu-balita-lansia.jpg",
    imageAlt: "Kegiatan posyandu balita dan lansia di Balai Desa Keseneng",
    publishedAt: "2026-06-12T08:30:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "b2e7f240-78cf-4c5a-9342-dc4c0b2d0b55",
    title: "Perbaikan Jalan Lingkungan Masuk Tahap Penyelesaian",
    slug: "perbaikan-jalan-lingkungan-masuk-tahap-penyelesaian",
    excerpt:
      "Pekerjaan perbaikan akses lingkungan dilakukan bertahap untuk mendukung mobilitas warga dan distribusi hasil pertanian.",
    category: "Pembangunan",
    imageUrl: "/images/berita/perbaikan-jalan-lingkungan.jpg",
    imageAlt: "Pekerja menyelesaikan perbaikan jalan lingkungan desa",
    publishedAt: "2026-06-06T14:00:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "9e77aa5b-c5b5-4b61-8f23-9b7bdf96a606",
    title: "Produk UMKM Lokal Dipasarkan Lewat Kegiatan Desa",
    slug: "produk-umkm-lokal-dipasarkan-lewat-kegiatan-desa",
    excerpt:
      "Pelaku usaha rumahan memperkenalkan produk olahan pangan dan kerajinan lokal dalam agenda pelayanan dan kegiatan warga.",
    category: "UMKM",
    imageUrl: "/images/berita/produk-umkm-lokal.jpg",
    imageAlt: "Produk UMKM lokal Desa Keseneng ditata di meja pamer",
    publishedAt: "2026-05-29T09:30:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "f92d39b2-e09e-4508-9dd9-2cf8e3ebdb3f",
    title: "Musyawarah Desa Bahas Prioritas Program Tahun Depan",
    slug: "musyawarah-desa-bahas-prioritas-program-tahun-depan",
    excerpt:
      "Perwakilan warga, lembaga desa, dan pemerintah desa menyampaikan usulan program yang akan masuk pembahasan perencanaan.",
    category: "Pemerintahan",
    imageUrl: "/images/berita/musyawarah-desa.jpg",
    imageAlt: "Warga mengikuti musyawarah desa di aula balai desa",
    publishedAt: "2026-05-20T13:00:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
  {
    id: "3df67db0-18fb-4b1d-8f83-7c1c1f0206c4",
    title: "Pengumuman Jadwal Pelayanan Administrasi Pekan Ini",
    slug: "pengumuman-jadwal-pelayanan-administrasi-pekan-ini",
    excerpt:
      "Pemerintah desa menginformasikan jadwal pelayanan administrasi agar warga dapat mengurus kebutuhan surat dengan tertib.",
    category: "Pengumuman",
    imageUrl: "/images/berita/jadwal-pelayanan-administrasi.jpg",
    imageAlt: "Petugas pelayanan administrasi Desa Keseneng melayani warga",
    publishedAt: "2026-05-14T07:30:00+07:00",
    authorName: "Admin Desa Keseneng",
  },
];

export async function getHomepageLatestNews(limit = 3) {
  return fallbackLatestNews.slice(0, limit);
}

export async function getLatestNews() {
  return fallbackLatestNews;
}

export async function searchLatestNews({
  query,
  category,
  limit,
}: {
  query?: string | null;
  category?: string | null;
  limit?: number | null;
}) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();

  const filteredNews = fallbackLatestNews.filter((item) => {
    const searchableContent = [
      item.title,
      item.excerpt,
      item.category,
      item.authorName,
    ]
      .join(" ")
      .toLowerCase();
    const matchQuery = normalizedQuery
      ? searchableContent.includes(normalizedQuery)
      : true;
    const matchCategory = normalizedCategory
      ? item.category.toLowerCase() === normalizedCategory
      : true;

    return matchQuery && matchCategory;
  });

  const limitedNews = limit && Number.isFinite(limit) && limit > 0
    ? filteredNews.slice(0, limit)
    : filteredNews;

  return {
    data: limitedNews,
    total: limitedNews.length,
    available: filteredNews.length,
    query: normalizedQuery ?? null,
    category: normalizedCategory ?? null,
    limit: limit ?? null,
  };
}

export async function getLatestNewsBySlug(slug: string) {
  return fallbackLatestNews.find((item) => item.slug === slug) ?? null;
}
