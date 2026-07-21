import { AdminCrudPage } from "@/components/admin-crud-page";
import { listOfficialRecords } from "@/lib/profile-officials";

export default function AdminPerangkatPage() {
  return (
    <AdminCrudPage
      eyebrow="Admin Perangkat Desa"
      title="Kelola data perangkat desa"
      description="Tambah, ubah, hapus, dan urutkan perangkat desa yang tampil di profil publik."
      endpoint="/api/admin/officials"
      activeHref="/admin/perangkat"
      publicHref="/profil"
      initialRows={listOfficialRecords() as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "name", label: "Nama", required: true },
        { name: "role", label: "Jabatan", required: true },
        { name: "focus", label: "Fokus tugas", type: "textarea", required: true },
        { name: "contact", label: "Kontak", required: true },
        { name: "area", label: "Bidang", required: true },
        { name: "photoUrl", label: "Path foto", type: "hidden" },
        { name: "photoFile", label: "Upload foto perangkat", type: "file", accept: "image/jpeg,image/png,image/webp" },
        { name: "photoAlt", label: "Deskripsi foto", defaultValue: "Foto perangkat Desa Keseneng" },
        { name: "displayOrder", label: "Urutan", type: "number", defaultValue: "1", required: true },
      ]}
      tableColumns={[
        { key: "displayOrder", label: "Urutan" },
        { key: "name", label: "Nama" },
        { key: "role", label: "Jabatan" },
        { key: "area", label: "Bidang" },
        { key: "contact", label: "Kontak" },
      ]}
    />
  );
}





