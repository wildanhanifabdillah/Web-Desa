import { AdminCrudPage } from "@/components/admin-crud-page";
import { listCategoryRecords } from "@/lib/potential-category-store";

export default async function AdminPotensiKategoriPage() {
  const categories = await listCategoryRecords();

  return (
    <AdminCrudPage
      eyebrow="Admin Potensi Desa"
      title="Kelola kategori potensi"
      description="Tambah, edit, dan hapus kategori potensi desa. Gambar kategori diunggah langsung dari perangkat admin."
      endpoint="/api/admin/potentials/categories"
      activeHref="/admin/potensi/kategori"
      publicHref="/potensi"
      idField="slug"
      deleteParam="slug"
      initialRows={categories as unknown as Array<Record<string, unknown>>}
      createDefaults={{
        detail: { eyebrow: "Potensi", intro: "Ringkasan potensi desa.", description: "Deskripsi potensi desa.", opportunities: [], programs: [], contact: { name: "Admin Desa Keseneng", role: "Pengelola potensi desa", email: "pemdes@keseneng.desa.id" } },
        gallery: [],
        stats: { value: "0", label: "Data" },
        highlights: [],
        accentClassName: "bg-sage-50 text-sage-800",
      }}
      updateDefaults={{
        detail: { eyebrow: "Potensi", intro: "Ringkasan potensi desa.", description: "Deskripsi potensi desa.", opportunities: [], programs: [], contact: { name: "Admin Desa Keseneng", role: "Pengelola potensi desa", email: "pemdes@keseneng.desa.id" } },
        gallery: [],
        stats: { value: "0", label: "Data" },
        highlights: [],
        accentClassName: "bg-sage-50 text-sage-800",
      }}
      fields={[
        { name: "label", label: "Nama kategori", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "title", label: "Judul", required: true },
        { name: "summary", label: "Ringkasan", type: "textarea", required: true },
        { name: "image", label: "Path gambar", type: "hidden", defaultValue: "/images/potensi/pertanian-sawah.jpg" },
        { name: "file", label: "Upload gambar", type: "file", accept: "image/jpeg,image/png,image/webp" },
      ]}
      tableColumns={[
        { key: "label", label: "Kategori" },
        { key: "title", label: "Judul" },
        { key: "summary", label: "Ringkasan" },
      ]}
    />
  );
}




