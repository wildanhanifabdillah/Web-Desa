export type PotentialCategory = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  image: string;
  detail: {
    eyebrow: string;
    intro: string;
    description: string;
    opportunities: string[];
    programs: {
      title: string;
      description: string;
    }[];
    contact: {
      name: string;
      role: string;
      email: string;
    };
  };
  gallery: {
    title: string;
    description: string;
    image: string;
  }[];
  stats: {
    value: string;
    label: string;
  };
  highlights: string[];
  accentClassName: string;
};

const fallbackPotentialCategories: PotentialCategory[] = [
  {
    "slug": "wisata-alam",
    "label": "Wisata Alam",
    "title": "Wisata alam Desa Keseneng",
    "summary": "Lanskap perbukitan, jalur jelajah, dan ruang alam desa menjadi daya tarik kunjungan yang dekat dengan kehidupan warga.",
    "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
    "detail": {
      "eyebrow": "Potensi Wisata Alam",
      "intro": "Wisata alam Keseneng menonjolkan suasana perbukitan, titik pandang, dan pengalaman kunjungan yang tetap dekat dengan desa.",
      "description": "Pengembangan wisata alam diarahkan untuk menata informasi lokasi, akses, dokumentasi visual, kebersihan area, serta cerita warga agar pengunjung mudah memahami karakter alam Desa Keseneng sebelum datang.",
      "opportunities": [
        "Pemetaan titik kunjungan alam dan jalur akses warga.",
        "Publikasi foto, rute, dan aturan kunjungan yang ramah pengunjung.",
        "Penguatan cerita lokal sebagai nilai tambah wisata desa."
      ],
      "programs": [
        {
          "title": "Peta Titik Wisata",
          "description": "Lokasi wisata alam ditata sebagai informasi publik agar pengunjung mudah merencanakan kunjungan."
        },
        {
          "title": "Dokumentasi Kunjungan",
          "description": "Foto dan cerita lapangan dikelola admin untuk memperbarui wajah wisata alam desa."
        }
      ],
      "contact": {
        "name": "Pengelola Wisata Desa Keseneng",
        "role": "Pengelola data wisata alam",
        "email": "wisata@keseneng.desa.id"
      }
    },
    "gallery": [
      {
        "title": "Lanskap perbukitan",
        "description": "Pemandangan alam desa yang menjadi daya tarik kunjungan.",
        "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Jalur jelajah desa",
        "description": "Rute alam yang menghubungkan ruang warga dan titik kunjungan.",
        "image": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Ruang alam warga",
        "description": "Area terbuka desa yang dapat dikembangkan sebagai pengalaman wisata.",
        "image": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80"
      }
    ],
    "stats": {
      "value": "3",
      "label": "titik kunjungan"
    },
    "highlights": [
      "Perbukitan",
      "Jalur jelajah",
      "Pemandangan"
    ],
    "accentClassName": "bg-emerald-100 text-emerald-800"
  },
  {
    "slug": "agro-tourism",
    "label": "Agro Tourism",
    "title": "Agro tourism dan kebun produktif",
    "summary": "Sawah, kebun, dan aktivitas tani warga dapat dikemas sebagai pengalaman edukasi pertanian dan kunjungan berbasis desa.",
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    "detail": {
      "eyebrow": "Potensi Agro Tourism",
      "intro": "Agro tourism menghubungkan aktivitas pertanian warga dengan pengalaman belajar, melihat proses tanam, dan mengenal komoditas desa.",
      "description": "Pengembangan agro tourism diarahkan pada pendataan lahan produktif, komoditas unggulan, kelompok tani, agenda panen, serta aktivitas edukasi yang dapat ditampilkan secara rapi di website desa.",
      "opportunities": [
        "Pemetaan komoditas sawah dan kebun berdasarkan musim tanam.",
        "Publikasi aktivitas kelompok tani dan periode panen.",
        "Paket edukasi ringan untuk pengunjung yang ingin mengenal pertanian desa."
      ],
      "programs": [
        {
          "title": "Katalog Komoditas",
          "description": "Daftar hasil pertanian disusun agar admin desa dapat menampilkan produk utama dan periode panen."
        },
        {
          "title": "Cerita Kelompok Tani",
          "description": "Aktivitas kelompok tani dikemas sebagai konten publikasi rutin untuk memperlihatkan proses produksi."
        }
      ],
      "contact": {
        "name": "Kelompok Tani Desa Keseneng",
        "role": "Pengelola data agro tourism",
        "email": "agro@keseneng.desa.id"
      }
    },
    "gallery": [
      {
        "title": "Hamparan sawah produktif",
        "description": "Area pertanian warga yang menjadi bagian potensi agro tourism.",
        "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Pengelolaan kebun sayur",
        "description": "Kebun warga dikelola untuk kebutuhan harian, pasar lokal, dan edukasi.",
        "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Panen bersama warga",
        "description": "Kegiatan panen menjadi ruang belajar dan kerja kolektif antarkeluarga.",
        "image": "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?auto=format&fit=crop&w=900&q=80"
      }
    ],
    "stats": {
      "value": "312 ha",
      "label": "lahan produktif"
    },
    "highlights": [
      "Sawah",
      "Kebun",
      "Edukasi tani"
    ],
    "accentClassName": "bg-sage-100 text-sage-800"
  },
  {
    "slug": "umkm",
    "label": "UMKM",
    "title": "Produk lokal dan usaha warga",
    "summary": "Olahan pangan, kerajinan, dan layanan warga disiapkan untuk memperluas pasar melalui publikasi digital desa.",
    "image": "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=1200&q=85",
    "detail": {
      "eyebrow": "Potensi UMKM",
      "intro": "UMKM warga menjadi pintu penguatan ekonomi lokal melalui produk pangan, kerajinan, dan layanan desa.",
      "description": "Halaman detail UMKM disiapkan untuk menampung katalog produk, profil pelaku usaha, informasi kontak, dan cerita produksi agar produk lokal lebih mudah dipromosikan secara digital.",
      "opportunities": [
        "Katalog produk lokal dengan foto dan deskripsi singkat.",
        "Profil pelaku usaha serta kontak pemesanan.",
        "Publikasi cerita produksi dan pengemasan produk warga."
      ],
      "programs": [
        {
          "title": "Katalog Produk",
          "description": "Produk warga dikelompokkan agar pengunjung mudah membaca jenis, cerita, dan potensi pasarnya."
        },
        {
          "title": "Profil Pelaku Usaha",
          "description": "Data UMKM ditata sebagai dasar admin untuk mengelola informasi usaha warga."
        }
      ],
      "contact": {
        "name": "Forum UMKM Desa Keseneng",
        "role": "Pengelola data usaha warga",
        "email": "umkm@keseneng.desa.id"
      }
    },
    "gallery": [
      {
        "title": "Produk olahan pangan",
        "description": "Produk warga disiapkan untuk katalog dan kanal penjualan.",
        "image": "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Kemasan produk lokal",
        "description": "Penguatan kemasan membantu produk tampil lebih siap pasar.",
        "image": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Etalase usaha warga",
        "description": "Ragam usaha kecil menjadi bagian penting ekonomi desa.",
        "image": "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80"
      }
    ],
    "stats": {
      "value": "48",
      "label": "usaha warga"
    },
    "highlights": [
      "Olahan pangan",
      "Kerajinan",
      "Katalog digital"
    ],
    "accentClassName": "bg-sky-100 text-sky-800"
  },
  {
    "slug": "seni-budaya",
    "label": "Seni & Budaya",
    "title": "Seni dan budaya Desa Keseneng",
    "summary": "Jenis kesenian dan paguyuban aktif dikelola sebagai identitas budaya desa melalui dokumentasi yang mudah dibaca warga.",
    "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85",
    "detail": {
      "eyebrow": "Potensi Seni & Budaya",
      "intro": "Seni dan budaya warga menjadi ruang ekspresi, regenerasi tradisi, dan penguatan identitas Desa Keseneng.",
      "description": "Pengelolaan potensi seni budaya diarahkan untuk mendokumentasikan jenis kesenian, kelompok seni aktif, jadwal latihan, agenda pentas, dan cerita budaya agar identitas desa tampil lebih kuat di kanal digital.",
      "opportunities": [
        "Arsip foto dan narasi kelompok seni desa.",
        "Publikasi agenda pentas budaya dan kegiatan latihan.",
        "Pelibatan pemuda dalam dokumentasi tradisi lokal."
      ],
      "programs": [
        {
          "title": "Agenda Pentas",
          "description": "Jadwal kegiatan seni ditata sebagai informasi publik yang mudah diakses warga dan pengunjung."
        },
        {
          "title": "Arsip Budaya",
          "description": "Foto, cerita, dan profil pelaku seni disimpan sebagai dokumentasi digital desa."
        }
      ],
      "contact": {
        "name": "Komunitas Seni Keseneng",
        "role": "Pengelola kegiatan budaya",
        "email": "budaya@keseneng.desa.id"
      }
    },
    "gallery": [
      {
        "title": "Latihan seni warga",
        "description": "Ruang latihan menjadi tempat regenerasi kelompok seni desa.",
        "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Pentas budaya tahunan",
        "description": "Panggung desa menghubungkan tradisi dengan generasi muda.",
        "image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80"
      },
      {
        "title": "Dokumentasi tradisi",
        "description": "Arsip visual disiapkan untuk mengenalkan identitas budaya.",
        "image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80"
      }
    ],
    "stats": {
      "value": "4",
      "label": "jenis seni"
    },
    "highlights": [
      "Lengger",
      "Jaran Kepang",
      "Bundengan"
    ],
    "accentClassName": "bg-amber-100 text-amber-800"
  }
];

export async function getPotentialCategories() {
  return fallbackPotentialCategories;
}

export async function getPotentialCategoryBySlug(slug: string) {
  return fallbackPotentialCategories.find((category) => category.slug === slug);
}
