import { AdminCrudPage } from "@/components/admin-crud-page";
import { listGalleryAlbumRecords } from "@/lib/gallery-store";

export default async function AdminGaleriPage() {
  const albums = await listGalleryAlbumRecords();
  const rows = albums.map((album) => ({
    ...album,
    photosJson: JSON.stringify(album.photos, null, 2),
  }));

  return (
    <AdminCrudPage
      eyebrow="Admin Galeri"
      title="Kelola album foto"
      description="Tambah, edit, hapus album galeri. Cover album bisa diunggah langsung, sedangkan foto album dikelola lewat tombol Kelola Foto."
      endpoint="/api/admin/gallery"
      activeHref="/admin/galeri"
      publicHref="/galeri"
      idField="slug"
      deleteParam="slug"
      initialRows={rows as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "category", label: "Kategori", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "coverImage", label: "Path cover", type: "hidden", defaultValue: "/hero-section.webp" },
        { name: "file", label: "Upload cover", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "photosJson", label: "Daftar foto", type: "hidden", defaultValue: "[]" },
      ]}
      rowActions={[{ label: "Kelola Foto", hrefTemplate: "/admin/galeri/:slug/foto" }]}
      tableColumns={[
        { key: "title", label: "Judul" },
        { key: "category", label: "Kategori" },
        { key: "photoCount", label: "Foto" },
        { key: "updatedAt", label: "Update" },
      ]}
    />
  );
}







