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
    slug: "pertanian",
    label: "Pertanian",
    title: "Pertanian pangan dan kebun produktif",
    summary:
      "Sawah, kebun sayur, dan kelompok tani menjadi penggerak utama ekonomi warga sekaligus identitas Desa Keseneng.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    detail: {
      eyebrow: "Potensi Pertanian",
      intro:
        "Pertanian menjadi tulang punggung ekonomi lokal dengan lahan produktif, kelompok tani aktif, dan praktik kerja warga yang kuat.",
      description:
        "Pengembangan pertanian Desa Keseneng diarahkan pada peningkatan kualitas hasil pangan, penguatan kelembagaan kelompok tani, dan publikasi komoditas unggulan agar lebih mudah dikenali warga, mitra, dan pasar sekitar.",
      opportunities: [
        "Pemetaan komoditas sawah dan kebun berdasarkan musim tanam.",
        "Publikasi profil kelompok tani dan hasil panen unggulan.",
        "Penguatan kanal informasi untuk edukasi pertanian warga.",
      ],
      programs: [
        {
          title: "Katalog Komoditas",
          description:
            "Daftar hasil pertanian disusun agar admin desa dapat menampilkan produk utama dan periode panen.",
        },
        {
          title: "Cerita Kelompok Tani",
          description:
            "Aktivitas kelompok tani dikemas sebagai konten publikasi rutin untuk memperlihatkan proses produksi.",
        },
      ],
      contact: {
        name: "Kelompok Tani Desa Keseneng",
        role: "Pengelola data pertanian",
        email: "pertanian@keseneng.desa.id",
      },
    },
    gallery: [
      {
        title: "Hamparan sawah produktif",
        description: "Area pertanian warga yang menjadi sumber pangan utama.",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Pengelolaan kebun sayur",
        description: "Kebun warga dikelola untuk kebutuhan harian dan pasar lokal.",
        image:
          "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Panen bersama warga",
        description: "Kegiatan panen menjadi ruang kerja kolektif antarkeluarga.",
        image:
          "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?auto=format&fit=crop&w=900&q=80",
      },
    ],
    stats: {
      value: "312 ha",
      label: "lahan produktif",
    },
    highlights: ["Padi", "Sayuran", "Kelompok tani"],
    accentClassName: "bg-sage-100 text-sage-800",
  },
  {
    slug: "kesenian",
    label: "Kesenian",
    title: "Kesenian warga dan tradisi desa",
    summary:
      "Kelompok seni lokal menjaga ruang latihan, pentas tahunan, dan regenerasi anak muda agar tradisi desa tetap hidup.",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85",
    detail: {
      eyebrow: "Potensi Kesenian",
      intro:
        "Kesenian warga menjadi ruang ekspresi budaya sekaligus media regenerasi tradisi Desa Keseneng.",
      description:
        "Pengelolaan potensi kesenian diarahkan untuk mendokumentasikan kelompok seni, jadwal latihan, agenda pentas, dan cerita budaya agar identitas desa tampil lebih kuat di kanal digital.",
      opportunities: [
        "Arsip foto dan narasi kelompok seni desa.",
        "Publikasi agenda pentas budaya dan kegiatan latihan.",
        "Pelibatan pemuda dalam dokumentasi tradisi lokal.",
      ],
      programs: [
        {
          title: "Agenda Pentas",
          description:
            "Jadwal kegiatan seni ditata sebagai informasi publik yang mudah diakses warga dan pengunjung.",
        },
        {
          title: "Arsip Budaya",
          description:
            "Foto, cerita, dan profil pelaku seni disimpan sebagai dokumentasi digital desa.",
        },
      ],
      contact: {
        name: "Komunitas Seni Keseneng",
        role: "Pengelola kegiatan budaya",
        email: "kesenian@keseneng.desa.id",
      },
    },
    gallery: [
      {
        title: "Latihan seni warga",
        description: "Ruang latihan menjadi tempat regenerasi kelompok seni desa.",
        image:
          "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Pentas budaya tahunan",
        description: "Panggung desa menghubungkan tradisi dengan generasi muda.",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Dokumentasi tradisi",
        description: "Arsip visual disiapkan untuk mengenalkan identitas budaya.",
        image:
          "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80",
      },
    ],
    stats: {
      value: "5",
      label: "komunitas seni",
    },
    highlights: ["Pentas budaya", "Latihan rutin", "Regenerasi"],
    accentClassName: "bg-amber-100 text-amber-800",
  },
  {
    slug: "umkm",
    label: "UMKM",
    title: "Produk lokal dan usaha warga",
    summary:
      "Olahan pangan, kerajinan, dan layanan warga disiapkan untuk memperluas pasar melalui publikasi digital desa.",
    image:
      "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=1200&q=85",
    detail: {
      eyebrow: "Potensi UMKM",
      intro:
        "UMKM warga menjadi pintu penguatan ekonomi lokal melalui produk pangan, kerajinan, dan layanan desa.",
      description:
        "Halaman detail UMKM disiapkan untuk menampung katalog produk, profil pelaku usaha, informasi kontak, dan cerita produksi agar produk lokal lebih mudah dipromosikan secara digital.",
      opportunities: [
        "Katalog produk lokal dengan foto dan deskripsi singkat.",
        "Profil pelaku usaha serta kontak pemesanan.",
        "Publikasi cerita produksi dan pengemasan produk warga.",
      ],
      programs: [
        {
          title: "Katalog Produk",
          description:
            "Produk warga dikelompokkan agar pengunjung mudah membaca jenis, cerita, dan potensi pasarnya.",
        },
        {
          title: "Profil Pelaku Usaha",
          description:
            "Data UMKM ditata sebagai dasar admin untuk mengelola informasi usaha warga.",
        },
      ],
      contact: {
        name: "Forum UMKM Desa Keseneng",
        role: "Pengelola data usaha warga",
        email: "umkm@keseneng.desa.id",
      },
    },
    gallery: [
      {
        title: "Produk olahan pangan",
        description: "Produk warga disiapkan untuk katalog dan kanal penjualan.",
        image:
          "https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Kemasan produk lokal",
        description: "Penguatan kemasan membantu produk tampil lebih siap pasar.",
        image:
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Etalase usaha warga",
        description: "Ragam usaha kecil menjadi bagian penting ekonomi desa.",
        image:
          "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
      },
    ],
    stats: {
      value: "48",
      label: "usaha warga",
    },
    highlights: ["Olahan pangan", "Kerajinan", "Katalog digital"],
    accentClassName: "bg-sky-100 text-sky-800",
  },
  {
    slug: "peternakan",
    label: "Peternakan",
    title: "Peternakan skala warga",
    summary:
      "Ternak keluarga dan kelompok kecil menjadi penopang ekonomi tambahan yang terhubung dengan kebutuhan pangan lokal.",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=85",
    detail: {
      eyebrow: "Potensi Peternakan",
      intro:
        "Peternakan warga mendukung ekonomi rumah tangga dan memperkuat siklus pangan lokal desa.",
      description:
        "Data peternakan disiapkan untuk mengenalkan kelompok ternak, jenis komoditas, kebutuhan pakan, dan peluang pengembangan usaha skala warga secara bertahap.",
      opportunities: [
        "Pemetaan kelompok ternak dan jenis komoditas warga.",
        "Publikasi praktik perawatan serta pemanfaatan pakan lokal.",
        "Informasi peluang kemitraan untuk penguatan peternakan desa.",
      ],
      programs: [
        {
          title: "Profil Kelompok Ternak",
          description:
            "Informasi kelompok ternak ditampilkan sebagai dasar pendataan dan publikasi potensi.",
        },
        {
          title: "Siklus Pakan Lokal",
          description:
            "Narasi pakan lokal membantu memperlihatkan hubungan pertanian dan peternakan warga.",
        },
      ],
      contact: {
        name: "Kelompok Ternak Keseneng",
        role: "Pengelola data peternakan",
        email: "peternakan@keseneng.desa.id",
      },
    },
    gallery: [
      {
        title: "Ternak keluarga",
        description: "Peternakan skala rumah tangga mendukung pendapatan warga.",
        image:
          "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Kandang kelompok",
        description: "Pengelolaan bersama memperkuat perawatan dan distribusi pakan.",
        image:
          "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Pakan lokal",
        description: "Sumber pakan sekitar desa menjadi bagian dari siklus produksi.",
        image:
          "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
      },
    ],
    stats: {
      value: "9",
      label: "kelompok ternak",
    },
    highlights: ["Kambing", "Unggas", "Pakan lokal"],
    accentClassName: "bg-rose-100 text-rose-800",
  },
];

export async function getPotentialCategories() {
  return fallbackPotentialCategories;
}

export async function getPotentialCategoryBySlug(slug: string) {
  return fallbackPotentialCategories.find((category) => category.slug === slug);
}
