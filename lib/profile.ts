import { listGeographyRecords } from "@/lib/profile-geography";
import { listProfileGeneralRecords } from "@/lib/profile-general";
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
      "Halaman profil menyajikan gambaran umum, kondisi geografis, visi misi, dan perangkat Desa Keseneng sebagai dasar informasi publik untuk warga dan pengunjung.",
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
      "Gambaran umum ini menampilkan informasi profil yang dikelola melalui panel admin desa.",
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
      "Visi dan misi ini menampilkan arah pembangunan desa yang dikelola melalui panel admin.",
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
  const general = (await listProfileGeneralRecords())[0];
  const geography = (await listGeographyRecords())[0];
  const visionMission = (await listVisionMissionRecords())[0];
  const officials = await listOfficialRecords();

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
      kicker: general.overviewKicker,
      title: general.overviewTitle,
      description: general.overviewDescription,
      body: general.overviewBody,
      highlights: general.highlights,
      pillars: general.pillars,
    },
    geography: {
      ...fallbackProfileData.geography,
      kicker: geography.kicker,
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

