import { AdminCrudPage } from "@/components/admin-crud-page";
import { listVillageRegulationRecords } from "@/lib/village-regulation-store";

export default async function AdminDokumenPage() {
  const documents = await listVillageRegulationRecords();

  return (
    <AdminCrudPage
      eyebrow="Admin Dokumen / Perdes"
      title="Kelola dokumen dan Perdes"
      description="Tambah, edit, hapus, dan publikasikan Perdes atau dokumen hukum desa. PDF bisa diunggah langsung dari perangkat admin."
      endpoint="/api/admin/documents"
      activeHref="/admin/dokumen"
      publicHref="/dokumen"
      initialRows={documents as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "number", label: "Nomor dokumen", required: true },
        { name: "title", label: "Judul", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "year", label: "Tahun", type: "number", defaultValue: "2026", required: true },
        { name: "category", label: "Kategori", required: true },
        { name: "summary", label: "Ringkasan", type: "textarea", required: true },
        { name: "fileUrl", label: "Path PDF", type: "hidden" },
        { name: "fileType", label: "Jenis file", type: "hidden", defaultValue: "PDF" },
        { name: "fileSize", label: "Ukuran file", type: "hidden", defaultValue: "1 MB" },
        { name: "file", label: "Upload PDF", type: "file", accept: "application/pdf" },
        { name: "enactedAt", label: "Tanggal penetapan", type: "date", defaultValue: "2026-07-19", required: true },
        { name: "status", label: "Status", type: "select", defaultValue: "Berlaku", options: [
          { label: "Berlaku", value: "Berlaku" },
          { label: "Arsip", value: "Arsip" },
        ] },
      ]}
      tableColumns={[
        { key: "number", label: "Nomor" },
        { key: "title", label: "Judul" },
        { key: "category", label: "Kategori" },
        { key: "year", label: "Tahun" },
        { key: "fileSize", label: "Ukuran" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}

