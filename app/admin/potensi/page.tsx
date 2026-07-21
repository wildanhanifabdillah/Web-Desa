import { AdminCrudPage } from "@/components/admin-crud-page";
import { listCategoryRecords } from "@/lib/potential-category-store";
import { listPotentialItems } from "@/lib/potential-item-store";

export default async function AdminPotensiPage() {
  const [categories, items] = await Promise.all([
    listCategoryRecords(),
    listPotentialItems(),
  ]);

  return (
    <AdminCrudPage
      eyebrow="Admin Potensi Desa"
      title="Kelola item potensi"
      description="Tambah, edit, hapus, dan publikasikan item potensi desa. Foto item diunggah langsung dari perangkat admin."
      endpoint="/api/admin/potentials/items"
      activeHref="/admin/potensi"
      publicHref="/potensi"
      initialRows={items as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "categorySlug", label: "Kategori", type: "select", defaultValue: categories[0]?.slug ?? "pertanian", options: categories.map((category) => ({ label: category.label, value: category.slug })) },
        { name: "summary", label: "Ringkasan", type: "textarea", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "image", label: "Path gambar", type: "hidden", defaultValue: "/images/potensi/pertanian-sawah.jpg" },
        { name: "file", label: "Upload gambar", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "imageAlt", label: "Deskripsi gambar", defaultValue: "Potensi Desa Keseneng", required: true },
        { name: "publishedAt", label: "Tanggal publikasi", type: "date", defaultValue: "2026-07-15" },
        { name: "status", label: "Status", type: "select", defaultValue: "draft", options: [
          { label: "Draf", value: "draft" },
          { label: "Publik", value: "published" },
          { label: "Arsip", value: "archived" },
        ] },
      ]}
      tableColumns={[
        { key: "title", label: "Judul" },
        { key: "categorySlug", label: "Kategori" },
        { key: "status", label: "Status" },
        { key: "updatedAt", label: "Update" },
      ]}
    />
  );
}



