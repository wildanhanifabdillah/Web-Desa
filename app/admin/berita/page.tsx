import { AdminCrudPage } from "@/components/admin-crud-page";
import { listAdminNews } from "@/lib/admin-news-store";

export default async function AdminBeritaPage() {
  const news = await listAdminNews();

  return (
    <AdminCrudPage
      eyebrow="Admin Berita"
      title="Kelola berita desa"
      description="Tambah, edit, hapus, dan atur status publikasi berita desa. Gambar diunggah langsung dari perangkat admin."
      endpoint="/api/admin/news"
      activeHref="/admin/berita"
      publicHref="/berita"
      initialRows={news as unknown as Array<Record<string, unknown>>}
      enableNewsAiDraft
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "excerpt", label: "Ringkasan", type: "textarea", required: true },
        { name: "content", label: "Isi berita", type: "textarea", required: true },
        { name: "category", label: "Kategori", required: true },
        { name: "authorName", label: "Penulis", defaultValue: "Admin Desa Keseneng" },
        { name: "imageUrl", label: "Path gambar", type: "hidden", defaultValue: "/images/berita/informasi-publik.jpg" },
        { name: "file", label: "Upload gambar utama", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "galleryFiles", label: "Upload foto tambahan", type: "file", accept: "image/jpeg,image/png,image/webp", multiple: true },
        { name: "imageAlt", label: "Deskripsi gambar", defaultValue: "Ilustrasi berita Desa Keseneng" },
        { name: "status", label: "Status", type: "select", defaultValue: "draft", options: [
          { label: "Draf", value: "draft" },
          { label: "Publik", value: "published" },
          { label: "Arsip", value: "archived" },
        ] },
      ]}
      tableColumns={[
        { key: "title", label: "Judul" },
        { key: "category", label: "Kategori" },
        { key: "status", label: "Status" },
        { key: "authorName", label: "Penulis" },
      ]}
    />
  );
}





