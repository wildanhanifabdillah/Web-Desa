import { AdminCrudPage } from "@/components/admin-crud-page";
import { listCategoryRecords } from "@/lib/potential-category-store";
import { listPotentialItems } from "@/lib/potential-item-store";

export const dynamic = "force-dynamic";
export default async function AdminPotensiPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const [categories, items] = await Promise.all([
    listCategoryRecords(),
    listPotentialItems(),
  ]);
  const currentCategory = categories.find((category) => category.slug === params.category) ?? categories[0];
  const currentCategorySlug = currentCategory?.slug ?? "wisata-alam";
  const currentCategoryLabel = currentCategory?.label ?? "Wisata Alam";
  const filteredItems = items.filter((item) => item.categorySlug === currentCategorySlug);
  const endpoint = `/api/admin/potentials/items?category=${encodeURIComponent(currentCategorySlug)}`;

  return (
    <AdminCrudPage
      eyebrow="Admin Potensi Desa"
      title={`Kelola ${currentCategoryLabel}`}
      description={`Tambah, ubah, hapus, dan publikasikan data ${currentCategoryLabel.toLowerCase()} yang tampil di halaman Potensi Desa.`}
      endpoint={endpoint}
      activeHref={`/admin/potensi?category=${currentCategorySlug}`}
      subNavigation={[
        { label: "Wisata Alam", href: "/admin/potensi?category=wisata-alam" },
        { label: "Agro Tourism", href: "/admin/potensi?category=agro-tourism" },
        { label: "UMKM", href: "/admin/potensi?category=umkm" },
        { label: "Seni & Budaya", href: "/admin/potensi/seni-budaya" },
      ]}
      publicHref={getCategoryHref(currentCategory)}
      initialRows={filteredItems as unknown as Array<Record<string, unknown>>}
      fields={[
        { name: "title", label: "Judul", required: true },
        { name: "slug", label: "Slug", type: "hidden" },
        { name: "categorySlug", label: "Kategori", type: "select", defaultValue: currentCategorySlug, options: categories.map((category) => ({ label: category.label, value: category.slug })) },
        { name: "summary", label: "Ringkasan", type: "textarea", required: true },
        { name: "description", label: "Deskripsi", type: "textarea", required: true },
        { name: "image", label: "Path gambar", type: "hidden", defaultValue: "/images/potensi/wisata-alam.jpg" },
        { name: "file", label: "Unggah gambar", type: "file", accept: "image/jpeg,image/png,image/webp" },
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





function getCategoryHref(category: { slug: string; label: string; title: string } | undefined) {
  if (!category) {
    return "/potensi/wisata-alam";
  }

  const normalized = `${category.slug} ${category.label} ${category.title}`.toLowerCase();

  return normalized.includes("seni") || normalized.includes("budaya") || normalized.includes("kesenian")
    ? "/potensi/seni-budaya"
    : `/potensi/${category.slug}`;
}
