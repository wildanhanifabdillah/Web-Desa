import { listGeographyRecords } from "@/lib/profile-geography";
import { listProfileGeneralRecords } from "@/lib/profile-general";
import { listProfileHistoryRecords } from "@/lib/profile-history";
import { listOfficialRecords } from "@/lib/profile-officials";
import { listVisionMissionRecords } from "@/lib/profile-vision-mission";
export type ProfileFact = {
  label: string;
  value: string;
};

export type ProfileHighlight = {
  label: string;
  value: string;
};

export type ProfileTimelineItem = {
  period: string;
  title: string;
  description: string;
};

export type ProfileMission = {
  focus: string;
  description: string;
};

export type ProfileOfficial = {
  name: string;
  role: string;
  focus: string;
  contact: string;
  area: string;
  photoUrl?: string;
  photoAlt?: string;
};

export type ProfileData = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    facts: ProfileFact[];
  };
  overview: {
    kicker: string;
    title: string;
    description: string;
    body: string;
    highlights: ProfileHighlight[];
    pillars: string[];
  };
  history: {
    kicker: string;
    title: string;
    description: string;
    timeline: ProfileTimelineItem[];
  };
  geography: {
    kicker: string;
    title: string;
    description: string;
    stats: ProfileFact[];
    borders: ProfileFact[];
  };
  visionMission: {
    visionLabel: string;
    visionTitle: string;
    visionDescription: string;
    missions: ProfileMission[];
  };
  officials: {
    kicker: string;
    title: string;
    description: string;
    items: ProfileOfficial[];
  };
};

const fallbackProfileData: ProfileData = {
  hero: {
    eyebrow: "Profil Desa",
    title: "Mengenal Desa Keseneng, desa agraris dengan tradisi yang hidup.",
    description:
      "Halaman profil menyajikan gambaran umum, sejarah, visi misi, geografis, dan perangkat Desa Keseneng sebagai dasar informasi publik untuk warga dan pengunjung.",
    facts: [
      { label: "Kecamatan", value: "Mojotengah" },
      { label: "Kabupaten", value: "Wonosobo" },
      { label: "Provinsi", value: "Jawa Tengah" },
      { label: "Karakter", value: "Agraris dan budaya" },
    ],
  },
  overview: {
    kicker: "Gambaran Umum",
    title: "Desa yang bergerak dengan kekuatan warga dan potensi lokal.",
    description:
      "Gambaran umum ini memakai data tiruan sebagai dasar tampilan awal, sambil menunggu integrasi data asli dari admin desa.",
    body:
      "Desa Keseneng berada di wilayah perbukitan yang mendukung aktivitas pertanian, perkebunan, dan kegiatan masyarakat berbasis gotong royong. Warga menjaga potensi pangan, seni tradisi, serta produk lokal sebagai identitas desa yang terus dikembangkan.",
    highlights: [
      {
        label: "Karakter desa",
        value: "Agraris, guyub, dan aktif berkesenian",
      },
      {
        label: "Potensi utama",
        value: "Pertanian pangan, kesenian tradisi, dan produk warga",
      },
      {
        label: "Arah digital",
        value: "Informasi publik terbuka dan pengelolaan konten mandiri",
      },
    ],
    pillars: ["Pertanian", "Kesenian", "UMKM", "Gotong Royong"],
  },
  history: {
    kicker: "Sejarah Desa",
    title: "Linimasa perkembangan Desa Keseneng dari masa ke masa.",
    description:
      "Data berikut bersifat tiruan untuk membentuk pola tampilan sejarah desa sebelum konten resmi dimasukkan oleh admin.",
    timeline: [
      {
        period: "Masa awal",
        title: "Permukiman tumbuh di sekitar lahan produktif",
        description:
          "Warga mulai membangun ruang hidup desa dari aktivitas bertani, berbagi sumber air, dan kerja kolektif antar-keluarga.",
      },
      {
        period: "Penguatan dusun",
        title: "Gotong royong menjadi pola utama pembangunan",
        description:
          "Kegiatan jalan lingkungan, saluran air, dan ruang berkumpul warga dikerjakan melalui musyawarah serta swadaya masyarakat.",
      },
      {
        period: "Era pelayanan publik",
        title: "Administrasi desa semakin tertata",
        description:
          "Perangkat desa mulai menata layanan kependudukan, arsip, dan program pembangunan agar lebih mudah dijangkau warga.",
      },
      {
        period: "Hari ini",
        title: "Keseneng masuk fase publikasi digital",
        description:
          "Profil, berita, statistik, potensi, dan dokumen publik disiapkan dalam kanal digital untuk memperluas keterbukaan informasi.",
      },
    ],
  },
  geography: {
    kicker: "Kondisi Geografis",
    title: "Lanskap desa yang mendukung pangan dan wisata lokal.",
    description:
      "Wilayah desa didominasi area permukiman, sawah, kebun, dan ruang kegiatan warga. Kondisi alam ini menjadi modal penting untuk pengembangan pertanian produktif, kegiatan edukasi, dan potensi kunjungan berbasis budaya desa.",
    stats: [
      { label: "Luas wilayah", value: "328 ha" },
      { label: "Jumlah dusun", value: "2 dusun" },
      { label: "Ketinggian", value: "820 mdpl" },
      { label: "Dominasi lahan", value: "Sawah dan kebun" },
    ],
    borders: [
      { label: "Utara", value: "Desa Sojopuro" },
      { label: "Timur", value: "Desa Mudal" },
      { label: "Selatan", value: "Desa Lengkong" },
      { label: "Barat", value: "Akses wilayah dan lahan warga Desa Keseneng" },
    ],
  },
  visionMission: {
    visionLabel: "Visi Desa",
    visionTitle:
      "Terwujudnya Desa Keseneng yang maju, terbuka, mandiri, dan berdaya melalui potensi lokal.",
    visionDescription:
      "Visi dan misi ini memakai data tiruan untuk memandu desain halaman, sehingga admin nantinya tinggal mengganti konten resmi desa.",
    missions: [
      {
        focus: "Pelayanan Publik",
        description:
          "Meningkatkan kualitas pelayanan desa yang cepat, terbuka, dan mudah diakses warga.",
      },
      {
        focus: "Potensi Lokal",
        description:
          "Menguatkan pertanian, kesenian, dan UMKM sebagai identitas ekonomi Desa Keseneng.",
      },
      {
        focus: "Partisipasi Warga",
        description:
          "Mendorong gotong royong, musyawarah, dan keterlibatan warga dalam pembangunan desa.",
      },
      {
        focus: "Digitalisasi Desa",
        description:
          "Mengembangkan pemanfaatan teknologi untuk pengelolaan data dan publikasi kegiatan desa.",
      },
    ],
  },
  officials: {
    kicker: "Perangkat Desa",
    title: "Struktur pengelola layanan publik Desa Keseneng.",
    description:
      "Data berikut memakai format kartu agar warga mudah mengenali peran, fokus layanan, dan kontak setiap perangkat desa.",
    items: [
      {
        name: "Mugiharto, S.IP",
        role: "Kepala Desa",
        focus: "Koordinasi pemerintahan dan arah pembangunan desa",
        contact: "kades@keseneng.desa.id",
        area: "Pemerintahan",
      },
      {
        name: "Dwi Hermawan, ST",
        role: "Sekretaris Desa",
        focus: "Administrasi, arsip, dan layanan informasi publik",
        contact: "sekdes@keseneng.desa.id",
        area: "Administrasi",
      },
      {
        name: "Nisro, S.Sos",
        role: "Kepala Urusan Keuangan",
        focus: "Pengelolaan anggaran, pembukuan, dan laporan keuangan desa",
        contact: "keuangan@keseneng.desa.id",
        area: "Keuangan",
      },
      {
        name: "Sigit Hidayat",
        role: "Kepala Urusan Umum dan Perencanaan",
        focus: "Perencanaan program, aset, dan tata usaha umum desa",
        contact: "perencanaan@keseneng.desa.id",
        area: "Perencanaan",
      },
      {
        name: "Nurkhotib",
        role: "Kepala Seksi Pelayanan dan Kesejahteraan",
        focus: "Pelayanan sosial, pemberdayaan, dan kesejahteraan warga",
        contact: "pelayanan@keseneng.desa.id",
        area: "Pelayanan",
      },
      {
        name: "Sukarmiyadi",
        role: "Kepala Seksi Pemerintahan",
        focus: "Ketertiban administrasi wilayah dan urusan pemerintahan desa",
        contact: "pemerintahan@keseneng.desa.id",
        area: "Pemerintahan",
      },
      {
        name: "Surman Al Nurman Yuwono",
        role: "Kepala Dusun Bugel",
        focus: "Koordinasi layanan warga dan kegiatan kewilayahan Dusun Bugel",
        contact: "bugel@keseneng.desa.id",
        area: "Kewilayahan",
      },
    ],
  },
};

export async function getProfileData() {
  const general = listProfileGeneralRecords()[0];
  const geography = listGeographyRecords()[0];
  const visionMission = listVisionMissionRecords()[0];
  const history = listProfileHistoryRecords();
  const officials = listOfficialRecords();

  return {
    ...fallbackProfileData,
    hero: {
      ...fallbackProfileData.hero,
      title: `Mengenal ${general.villageName}, desa ${general.character.toLowerCase()}.`,
      description: general.description,
      facts: [
        { label: "Kecamatan", value: general.district },
        { label: "Kabupaten", value: general.regency },
        { label: "Provinsi", value: general.province },
        { label: "Karakter", value: general.character },
      ],
    },
    overview: {
      ...fallbackProfileData.overview,
      description: general.description,
      body: `${general.villageName} berada di wilayah ${general.regency} dengan karakter ${general.character.toLowerCase()}. Wilayah ini memiliki luas ${general.area}, ketinggian ${general.elevation}, dan dominasi lahan ${general.dominantLandUse.toLowerCase()}.`,
      highlights: [
        { label: "Karakter desa", value: general.character },
        { label: "Luas wilayah", value: general.area },
        { label: "Dominasi lahan", value: general.dominantLandUse },
      ],
    },
    history: {
      ...fallbackProfileData.history,
      timeline: history.map(({ period, title, description }) => ({ period, title, description })),
    },
    geography: {
      ...fallbackProfileData.geography,
      title: geography.title,
      description: geography.description,
      stats: geography.stats,
      borders: geography.borders,
    },
    visionMission: {
      visionLabel: visionMission.visionLabel,
      visionTitle: visionMission.visionTitle,
      visionDescription: visionMission.visionDescription,
      missions: visionMission.missions,
    },
    officials: {
      ...fallbackProfileData.officials,
      items: officials.map((official) => ({
        name: official.name,
        role: official.role,
        focus: official.focus,
        contact: official.contact,
        area: official.area,
        photoUrl: official.photoUrl,
        photoAlt: official.photoAlt,
      })),
    },
  };
}

