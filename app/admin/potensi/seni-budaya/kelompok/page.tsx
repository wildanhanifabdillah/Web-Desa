import { AdminCrudPage } from "@/components/admin-crud-page";
import { listArtGroups } from "@/lib/art-culture-store";

export const dynamic = "force-dynamic";

export default async function AdminKelompokSeniPage() {
  const groups = await listArtGroups();

  return (
    <AdminCrudPage
      eyebrow="Admin Potensi Desa"
      title="Kelola kelompok seni"
      description="Ubah data paguyuban seni, jumlah anggota, estimasi tarif, dan manajemen pertunjukan."
      endpoint="/api/admin/art-culture/groups"
      activeHref="/admin/potensi/seni-budaya/kelompok"
      subNavigation={[
        { label: "Wisata Alam", href: "/admin/potensi?category=wisata-alam" },
        { label: "Agro Tourism", href: "/admin/potensi?category=agro-tourism" },
        { label: "UMKM", href: "/admin/potensi?category=umkm" },
        { label: "Seni & Budaya", href: "/admin/potensi/seni-budaya" },
      ]}
      publicHref="/potensi/seni-budaya#kelompok-seni"
      initialRows={groups as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "name", label: "Nama paguyuban", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "foundedHistory", label: "Sejarah pendirian", type: "textarea", required: true },
        { name: "performanceManagement", label: "Manajemen pertunjukan", type: "textarea", required: true },
        { name: "memberCount", label: "Jumlah anggota aktif", type: "number", defaultValue: "0" },
        { name: "tariffMin", label: "Tarif minimum", type: "number", defaultValue: "0" },
        { name: "tariffMax", label: "Tarif maksimum", type: "number", defaultValue: "0" },
        { name: "contactName", label: "Nama kontak" },
        { name: "contactPhone", label: "Nomor kontak" },
        { name: "imageUrl", label: "Path gambar", type: "hidden", defaultValue: "/images/potensi/kesenian-lengger.jpg" },
        { name: "file", label: "Unggah foto kelompok", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "imageAlt", label: "Deskripsi foto", defaultValue: "Kelompok seni Desa Keseneng" },
        { name: "displayOrder", label: "Urutan", type: "number", defaultValue: "1" },
        { name: "status", label: "Status", type: "select", defaultValue: "active", options: [
          { label: "Aktif", value: "active" },
          { label: "Draf", value: "draft" },
          { label: "Arsip", value: "archived" },
        ] },
      ]}
      tableColumns={[
        { key: "name", label: "Paguyuban" },
        { key: "memberCount", label: "Anggota" },
        { key: "tariffMin", label: "Tarif min" },
        { key: "tariffMax", label: "Tarif max" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
