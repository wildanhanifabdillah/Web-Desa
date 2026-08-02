import { notFound, redirect } from "next/navigation";
import { listCategoryRecords } from "@/lib/potential-category-store";

export const dynamic = "force-dynamic";

export default async function PotensiPage() {
  const categories = await listCategoryRecords();
  const firstCategory = categories[0];

  if (!firstCategory) {
    notFound();
  }

  redirect(getCategoryHref(firstCategory));
}

function getCategoryHref(category: { slug: string; label: string; title: string }) {
  const normalized = `${category.slug} ${category.label} ${category.title}`.toLowerCase();

  return normalized.includes("seni") || normalized.includes("budaya") || normalized.includes("kesenian")
    ? "/potensi/seni-budaya"
    : `/potensi/${category.slug}`;
}
