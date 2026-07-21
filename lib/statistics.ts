export type StatisticMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  description: string;
};

export type StatisticChartItem = {
  label: string;
  value: number;
  colorClassName: string;
};

export type StatisticSection = {
  id: string;
  title: string;
  description: string;
  totalLabel: string;
  totalValue: number;
  unit: string;
  items: StatisticChartItem[];
};

const statisticsOverview: StatisticMetric[] = [
  {
    id: "penduduk",
    label: "Penduduk",
    value: 4210,
    unit: "jiwa",
    description: "Estimasi jumlah penduduk yang tercatat dalam data awal desa.",
  },
  {
    id: "kepala-keluarga",
    label: "Kepala Keluarga",
    value: 1286,
    unit: "KK",
    description: "Jumlah kepala keluarga sebagai basis layanan administrasi.",
  },
  {
    id: "dusun",
    label: "Dusun",
    value: 6,
    unit: "dusun",
    description: "Wilayah dusun yang menjadi cakupan pelayanan Desa Keseneng.",
  },
  {
    id: "rt-rw",
    label: "RT/RW",
    value: 34,
    unit: "unit",
    description: "Gabungan unit RT dan RW dalam struktur kewilayahan desa.",
  },
];

const statisticSections: StatisticSection[] = [
  {
    id: "usia",
    title: "Komposisi Usia",
    description:
      "Sebaran penduduk berdasarkan kelompok usia untuk membantu membaca kebutuhan layanan pendidikan, produktivitas, dan sosial.",
    totalLabel: "Total penduduk",
    totalValue: 4210,
    unit: "jiwa",
    items: [
      { label: "0-14 tahun", value: 842, colorClassName: "bg-sage-600" },
      { label: "15-24 tahun", value: 694, colorClassName: "bg-emerald-500" },
      { label: "25-54 tahun", value: 1845, colorClassName: "bg-sky-500" },
      { label: "55+ tahun", value: 829, colorClassName: "bg-amber-500" },
    ],
  },
  {
    id: "pendidikan",
    title: "Tingkat Pendidikan",
    description:
      "Data tiruan tingkat pendidikan warga sebagai gambaran awal kebutuhan program literasi dan pelatihan.",
    totalLabel: "Warga terdata",
    totalValue: 3510,
    unit: "orang",
    items: [
      { label: "SD/sederajat", value: 1180, colorClassName: "bg-sage-600" },
      { label: "SMP/sederajat", value: 875, colorClassName: "bg-emerald-500" },
      { label: "SMA/sederajat", value: 1025, colorClassName: "bg-sky-500" },
      { label: "Perguruan tinggi", value: 430, colorClassName: "bg-indigo-500" },
    ],
  },
  {
    id: "pekerjaan",
    title: "Mata Pencaharian",
    description:
      "Sebaran pekerjaan utama warga yang mendukung arah pengembangan ekonomi dan potensi desa.",
    totalLabel: "Warga bekerja",
    totalValue: 2460,
    unit: "orang",
    items: [
      { label: "Petani", value: 980, colorClassName: "bg-sage-600" },
      { label: "Wiraswasta/UMKM", value: 520, colorClassName: "bg-emerald-500" },
      { label: "Buruh", value: 610, colorClassName: "bg-orange-500" },
      { label: "PNS/karyawan", value: 350, colorClassName: "bg-sky-500" },
    ],
  },
];

export async function getVillageStatisticsOverview() {
  return statisticsOverview;
}

export async function getVillageStatisticSections() {
  return statisticSections;
}
export async function getVillageStatisticSectionByCategory(category: string) {
  const normalizedCategory = category.trim().toLowerCase();

  return statisticSections.find((section) => {
    return section.id.toLowerCase() === normalizedCategory ||
      section.title.toLowerCase() === normalizedCategory;
  }) ?? null;
}
