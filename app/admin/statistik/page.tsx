import { AdminCrudPage } from "@/components/admin-crud-page";
import { listAdminStatistics } from "@/lib/admin-statistics-store";

export default async function AdminStatistikPage() {
  const statistics = await listAdminStatistics();

  return (
    <AdminCrudPage
      eyebrow="Admin Statistik Desa"
      title="Kelola indikator statistik"
      description="Tambah, edit, hapus, dan publikasikan indikator ringkasan statistik desa."
      endpoint="/api/admin/statistics"
      activeHref="/admin/statistik"
      publicHref="/statistik"
      dataPath={["data", "metrics"]}
      deleteExtraQuery={{ type: "metric" }}
      initialRows={statistics.metrics as unknown as Array<Record<string, unknown>>}
      createDefaults={{ type: "metric" }}
      updateDefaults={{ type: "metric" }}
      fields={[
        { name: "type", label: "Tipe", type: "hidden", defaultValue: "metric" },
        { name: "label", label: "Nama indikator", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "category", label: "Kategori", defaultValue: "Umum", required: true },
        { name: "value", label: "Nilai", type: "number", defaultValue: "0", required: true },
        { name: "unit", label: "Satuan", defaultValue: "orang", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "status", label: "Status", type: "select", defaultValue: "draft", options: [
          { label: "Draf", value: "draft" },
          { label: "Publik", value: "published" },
          { label: "Arsip", value: "archived" },
        ] },
      ]}
      tableColumns={[
        { key: "label", label: "Indikator" },
        { key: "category", label: "Kategori" },
        { key: "value", label: "Nilai" },
        { key: "unit", label: "Satuan" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}


