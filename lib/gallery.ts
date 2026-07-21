export type GalleryPhoto = {
  id: string;
  title: string;
  description: string;
  image: string;
  takenAt: string;
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  photoCount: number;
  updatedAt: string;
  photos: GalleryPhoto[];
};

export type GalleryVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
};

const galleryAlbums: GalleryAlbum[] = [
  {
    id: "album-panen-raya",
    slug: "panen-raya-dan-gotong-royong-warga",
    title: "Panen Raya dan Gotong Royong Warga",
    category: "Pertanian",
    description:
      "Dokumentasi kegiatan panen bersama, pengangkutan hasil tani, dan kebersamaan warga di area persawahan.",
    coverImage:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    photoCount: 6,
    updatedAt: "2026-07-02T09:00:00+07:00",
    photos: [
      {
        id: "panen-1",
        title: "Hamparan Lahan Siap Panen",
        description: "Area persawahan warga menjelang kegiatan panen raya.",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T07:00:00+07:00",
      },
      {
        id: "panen-2",
        title: "Kerja Sama Warga",
        description: "Warga saling membantu mengangkut hasil panen dari lahan.",
        image:
          "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T08:30:00+07:00",
      },
      {
        id: "panen-3",
        title: "Hasil Tani Lokal",
        description: "Hasil panen ditata sebelum dibawa ke titik pengumpulan.",
        image:
          "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T10:00:00+07:00",
      },
      {
        id: "panen-4",
        title: "Diskusi Kelompok Tani",
        description: "Kelompok tani membahas perawatan lahan setelah panen.",
        image:
          "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T11:00:00+07:00",
      },
      {
        id: "panen-5",
        title: "Jalur Distribusi",
        description: "Akses jalan desa mendukung pengangkutan hasil pertanian.",
        image:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T13:00:00+07:00",
      },
      {
        id: "panen-6",
        title: "Kebersamaan Setelah Panen",
        description: "Warga berkumpul setelah kegiatan panen selesai.",
        image:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-07-01T15:00:00+07:00",
      },
    ],
  },
  {
    id: "album-pentas-budaya",
    slug: "pentas-budaya-dan-latihan-kesenian",
    title: "Pentas Budaya dan Latihan Kesenian",
    category: "Kesenian",
    description:
      "Kumpulan foto latihan, persiapan kostum, dan panggung seni warga yang melibatkan generasi muda desa.",
    coverImage:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80",
    photoCount: 6,
    updatedAt: "2026-06-25T10:00:00+07:00",
    photos: [
      {
        id: "budaya-1",
        title: "Latihan Musik Tradisi",
        description: "Kelompok seni berlatih untuk agenda pentas desa.",
        image:
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-24T15:00:00+07:00",
      },
      {
        id: "budaya-2",
        title: "Persiapan Panggung",
        description: "Pemuda desa menata area pertunjukan budaya.",
        image:
          "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-24T16:00:00+07:00",
      },
      {
        id: "budaya-3",
        title: "Kostum Pertunjukan",
        description: "Detail kostum dan properti kesenian warga.",
        image:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-24T17:00:00+07:00",
      },
      {
        id: "budaya-4",
        title: "Pentas Malam",
        description: "Suasana pentas budaya di ruang kegiatan warga.",
        image:
          "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-25T19:00:00+07:00",
      },
      {
        id: "budaya-5",
        title: "Partisipasi Pemuda",
        description: "Generasi muda ikut menjaga keberlanjutan seni desa.",
        image:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-25T20:00:00+07:00",
      },
      {
        id: "budaya-6",
        title: "Penonton Warga",
        description: "Warga menikmati agenda budaya tahunan desa.",
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-25T21:00:00+07:00",
      },
    ],
  },
  {
    id: "album-layanan-desa",
    slug: "pelayanan-publik-dan-musyawarah-desa",
    title: "Pelayanan Publik dan Musyawarah Desa",
    category: "Pemerintahan",
    description:
      "Arsip visual kegiatan pelayanan administrasi, musyawarah warga, dan koordinasi perangkat desa.",
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    photoCount: 4,
    updatedAt: "2026-06-15T13:30:00+07:00",
    photos: [
      {
        id: "layanan-1",
        title: "Meja Pelayanan",
        description: "Pelayanan administrasi warga di kantor desa.",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-15T08:00:00+07:00",
      },
      {
        id: "layanan-2",
        title: "Musyawarah Warga",
        description: "Forum warga membahas prioritas program desa.",
        image:
          "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-15T10:00:00+07:00",
      },
      {
        id: "layanan-3",
        title: "Koordinasi Perangkat",
        description: "Perangkat desa menyiapkan agenda layanan publik.",
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-15T11:00:00+07:00",
      },
      {
        id: "layanan-4",
        title: "Informasi Publik",
        description: "Dokumen dan pengumuman desa disiapkan untuk warga.",
        image:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-06-15T13:00:00+07:00",
      },
    ],
  },
  {
    id: "album-umkm-lokal",
    slug: "produk-umkm-dan-kuliner-lokal",
    title: "Produk UMKM dan Kuliner Lokal",
    category: "UMKM",
    description:
      "Ragam produk olahan pangan, kerajinan, dan aktivitas pelaku usaha rumahan Desa Keseneng.",
    coverImage:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
    photoCount: 4,
    updatedAt: "2026-05-30T08:30:00+07:00",
    photos: [
      {
        id: "umkm-1",
        title: "Produk Olahan Lokal",
        description: "Produk pangan rumahan siap dipasarkan.",
        image:
          "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-05-29T09:00:00+07:00",
      },
      {
        id: "umkm-2",
        title: "Meja Pamer Produk",
        description: "Pelaku UMKM menata produk dalam kegiatan desa.",
        image:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-05-29T10:00:00+07:00",
      },
      {
        id: "umkm-3",
        title: "Kerajinan Warga",
        description: "Kerajinan lokal menjadi bagian potensi ekonomi desa.",
        image:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-05-29T11:00:00+07:00",
      },
      {
        id: "umkm-4",
        title: "Pengemasan Produk",
        description: "Produk dikemas agar lebih siap masuk pasar digital.",
        image:
          "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=900&q=80",
        takenAt: "2026-05-29T13:00:00+07:00",
      },
    ],
  },
];

const galleryVideos: GalleryVideo[] = [
  {
    id: "video-profil-desa",
    title: "Profil Singkat Desa Keseneng",
    description:
      "Video pengantar tentang identitas desa, potensi unggulan, dan layanan informasi publik digital.",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    duration: "03:24",
    publishedAt: "2026-07-04T08:00:00+07:00",
  },
  {
    id: "video-panen-dan-potensi",
    title: "Cerita Panen dan Potensi Warga",
    description:
      "Cuplikan aktivitas warga saat mengelola lahan pertanian dan memasarkan hasil produksi lokal.",
    thumbnail:
      "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=900&q=80",
    duration: "04:10",
    publishedAt: "2026-06-20T09:15:00+07:00",
  },
  {
    id: "video-kegiatan-budaya",
    title: "Kegiatan Budaya Desa",
    description:
      "Dokumentasi singkat latihan kesenian, persiapan panggung, dan partisipasi pemuda dalam agenda budaya.",
    thumbnail:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80",
    duration: "02:48",
    publishedAt: "2026-06-08T14:00:00+07:00",
  },
];

export async function getGalleryAlbums() {
  return galleryAlbums;
}

export async function getGalleryAlbumBySlug(slug: string) {
  return galleryAlbums.find((album) => album.slug === slug) ?? null;
}

export async function getGalleryVideos() {
  return galleryVideos;
}
