import { AdminCrudPage } from "@/components/admin-crud-page";
import { listArtTypes } from "@/lib/art-culture-store";

export const dynamic = "force-dynamic";

export default function AdminJenisKesenianPage() {
  const types = listArtTypes();

  return (
    <AdminCrudPage
      eyebrow="Admin Potensi Desa"
      title="Kelola jenis kesenian"
      description="Ubah data jenis kesenian yang tampil di halaman Seni & Budaya. Setiap data bisa memakai foto unggahan admin."
      endpoint="/api/admin/art-culture/types"
      activeHref="/admin/potensi/seni-budaya/jenis"
      subNavigation={[
        { label: "Wisata Alam", href: "/admin/potensi?category=wisata-alam" },
        { label: "Agro Tourism", href: "/admin/potensi?category=agro-tourism" },
        { label: "UMKM", href: "/admin/potensi?category=umkm" },
        { label: "Seni & Budaya", href: "/admin/potensi/seni-budaya" },
      ]}
      publicHref="/potensi/seni-budaya"
      initialRows={types as unknown as Array<Record<string, unknown>>}
      rowActions={[{ label: "Kelompok", hrefTemplate: "/admin/potensi/seni-budaya/kelompok" }]}
      fields={[
        { name: "name", label: "Nama kesenian", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "summary", label: "Ringkasan", type: "textarea", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "history", label: "Sejarah", type: "textarea" },
        { name: "imageUrl", label: "Path gambar", type: "hidden", defaultValue: "/images/potensi/kesenian-lengger.jpg" },
        { name: "file", label: "Unggah foto kesenian", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "imageAlt", label: "Deskripsi foto", defaultValue: "Kesenian Desa Keseneng" },
        { name: "displayOrder", label: "Urutan", type: "number", defaultValue: "1" },
        { name: "status", label: "Status", type: "select", defaultValue: "active", options: [
          { label: "Aktif", value: "active" },
          { label: "Draf", value: "draft" },
          { label: "Arsip", value: "archived" },
        ] },
      ]}
      tableColumns={[
        { key: "name", label: "Jenis kesenian" },
        { key: "summary", label: "Ringkasan" },
        { key: "displayOrder", label: "Urutan" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
