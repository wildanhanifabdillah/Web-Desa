import { AdminCrudPage } from "@/components/admin-crud-page";
import { listGalleryVideoRecords } from "@/lib/gallery-store";

export default async function AdminGaleriVideoPage() {
  const videos = await listGalleryVideoRecords();

  return (
    <AdminCrudPage
      eyebrow="Admin Video Galeri"
      title="Kelola video galeri"
      description="Tambah, edit, hapus video galeri. Thumbnail bisa diunggah langsung dari perangkat admin."
      endpoint="/api/admin/gallery/videos"
      activeHref="/admin/galeri"
      publicHref="/galeri"
      initialRows={videos as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "id", label: "ID", type: "hidden" },
        { name: "title", label: "Judul", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "thumbnail", label: "Path thumbnail", type: "hidden", defaultValue: "/hero-section.webp" },
        { name: "file", label: "Upload thumbnail", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "duration", label: "Durasi", defaultValue: "03:00", required: true },
        { name: "publishedAt", label: "Tanggal publikasi", type: "date", defaultValue: "2026-07-15", required: true },
      ]}
      tableColumns={[
        { key: "title", label: "Judul" },
        { key: "duration", label: "Durasi" },
        { key: "publishedAt", label: "Publikasi" },
      ]}
    />
  );
}


