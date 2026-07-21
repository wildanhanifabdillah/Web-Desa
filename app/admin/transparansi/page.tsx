import { AdminCrudPage } from "@/components/admin-crud-page";
import { listTransparencyRecords } from "@/lib/transparency-store";

export default async function AdminTransparansiPage() {
  const documents = await listTransparencyRecords();

  return (
    <AdminCrudPage
      eyebrow="Admin Transparansi Desa"
      title="Kelola dokumen transparansi"
      description="Tambah, edit, hapus, dan publikasikan dokumen transparansi desa. PDF diunggah langsung dari perangkat admin."
      endpoint="/api/admin/transparency"
      activeHref="/admin/transparansi"
      publicHref="/transparansi"
      initialRows={documents as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "category", label: "Kategori", required: true },
        { name: "year", label: "Tahun", type: "number", defaultValue: "2026", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "fileUrl", label: "Path PDF", type: "hidden" },
        { name: "fileType", label: "Jenis file", type: "hidden", defaultValue: "PDF" },
        { name: "fileSize", label: "Ukuran file", type: "hidden", defaultValue: "1 MB" },
        { name: "file", label: "Upload PDF", type: "file", accept: "application/pdf" },
        { name: "publishedAt", label: "Tanggal publikasi", type: "date", defaultValue: "2026-07-15", required: true },
        { name: "status", label: "Status", type: "select", defaultValue: "Draf", options: [
          { label: "Draf", value: "Draf" },
          { label: "Dipublikasikan", value: "Dipublikasikan" },
        ] },
      ]}
      tableColumns={[
        { key: "title", label: "Dokumen" },
        { key: "category", label: "Kategori" },
        { key: "year", label: "Tahun" },
        { key: "fileSize", label: "Ukuran" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}


