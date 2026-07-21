import {
  createCategoryRecord,
  deleteCategoryRecord,
  getCategoryRecord,
  isPotentialCategoryInput,
  listCategoryRecords,
  resetCategoryRecords,
  updateCategoryRecord,
} from "@/lib/potential-category-store";
import { listPotentialItems } from "@/lib/potential-item-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 3 * 1024 * 1024;

type PotentialCategoryRecord = Awaited<ReturnType<typeof listCategoryRecords>>[number];

export async function GET(request: Request) {
  const categories = await listCategoryRecords();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();
  const slug = searchParams.get("slug")?.trim().toLowerCase();
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  if (limitParam && (!Number.isInteger(limit) || Number(limit) <= 0)) {
    return Response.json(
      { error: "Limit kategori potensi harus berupa angka bulat positif." },
      { status: 400 },
    );
  }

  if (slug) {
    const category = await getCategoryRecord(slug);

    if (!category) {
      return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: serializeAdminCategory(category) });
  }

  const filteredCategories = query
    ? categories.filter((category) => matchesCategoryQuery(category, query))
    : categories;
  const limitedCategories = limit ? filteredCategories.slice(0, limit) : filteredCategories;

  return Response.json({
    data: limitedCategories.map(serializeAdminCategory),
    meta: {
      total: limitedCategories.length,
      available: filteredCategories.length,
      query: query ?? null,
      limit: limit ?? null,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parseCategoryRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isPotentialCategoryInput(parsed.input)) {
    return Response.json(
      { error: "Payload kategori potensi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const category = await createCategoryRecord(parsed.input);

  if (!category) {
    return Response.json({ error: "Slug kategori potensi sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: serializeAdminCategory(category), meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseCategoryRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const slug = parsed.id ?? parsed.input.slug;

  if (!slug) {
    return Response.json({ error: "Slug kategori potensi wajib dikirim." }, { status: 400 });
  }

  const category = await updateCategoryRecord(slug.trim().toLowerCase(), parsed.input);

  if (!category) {
    return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: serializeAdminCategory(category), meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim().toLowerCase();
  const force = searchParams.get("force") === "true";

  if (searchParams.get("reset") === "true") {
    const categories = await resetCategoryRecords();

    return Response.json({
      data: categories.map(serializeAdminCategory),
      meta: { total: categories.length },
    });
  }

  if (!slug) {
    return Response.json({ error: "Slug kategori potensi wajib dikirim." }, { status: 400 });
  }

  if (!force) {
    const items = await listPotentialItems();
    const usedItems = items.filter((item) => item.categorySlug === slug);

    if (usedItems.length > 0) {
      return Response.json(
        {
          error: "Kategori potensi masih dipakai oleh item potensi.",
          meta: {
            totalItems: usedItems.length,
            itemSlugs: usedItems.map((item) => item.slug),
          },
        },
        { status: 409 },
      );
    }
  }

  const category = await deleteCategoryRecord(slug);

  if (!category) {
    return Response.json({ error: "Kategori potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: serializeAdminCategory(category) });
}

async function parseCategoryRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form kategori potensi tidak valid.", status: 400 };
    }

    return parseCategoryFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload kategori potensi wajib dikirim.", status: 400 };
  }

  const candidate = body as Record<string, unknown> & { slug?: string; id?: string };

  return { ok: true as const, id: candidate.id, input: candidate, upload: null };
}

async function parseCategoryFormData(formData: FormData) {
  const file = formData.get("file");
  const label = getFormString(formData, "label") ?? "kategori-potensi";
  const slug = getFormString(formData, "slug") ?? slugify(label);
  let image = getFormString(formData, "image");
  let upload = null;

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File gambar kategori tidak valid.", status: 400 };
  }

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "potensi",
      prefix: `kategori-${slug}`,
      allowedTypes: allowedImageTypes,
      maxSize: maxImageSize,
    });

    if (!stored.ok) {
      return stored;
    }

    image = stored.data.url;
    upload = stored.data;
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: {
      slug: slug ?? "",
      label: getFormString(formData, "label") ?? "",
      title: getFormString(formData, "title") ?? "",
      summary: getFormString(formData, "summary") ?? "",
      image: image ?? "",
      detail: getJsonField(formData, "detail") ?? defaultDetail(),
      gallery: getJsonField(formData, "gallery") ?? [],
      stats: getJsonField(formData, "stats") ?? { value: "0", label: "Data" },
      highlights: getJsonField(formData, "highlights") ?? [],
      accentClassName: getFormString(formData, "accentClassName") ?? "bg-sage-50 text-sage-800",
    },
    upload,
  };
}

function serializeAdminCategory(category: PotentialCategoryRecord) {
  return {
    slug: category.slug,
    label: category.label,
    title: category.title,
    summary: category.summary,
    image: category.image,
    detail: category.detail,
    gallery: category.gallery,
    stats: category.stats,
    highlights: category.highlights,
    accentClassName: category.accentClassName,
    meta: {
      totalGallery: category.gallery.length,
      totalHighlights: category.highlights.length,
      totalOpportunities: category.detail.opportunities.length,
      totalPrograms: category.detail.programs.length,
    },
  };
}

function matchesCategoryQuery(category: PotentialCategoryRecord, query: string) {
  return [
    category.slug,
    category.label,
    category.title,
    category.summary,
    category.detail.eyebrow,
    category.detail.intro,
    category.detail.description,
    category.detail.contact.name,
    ...category.highlights,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getJsonField(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

function defaultDetail() {
  return {
    eyebrow: "Potensi",
    intro: "Ringkasan potensi desa.",
    description: "Deskripsi potensi desa.",
    opportunities: [],
    programs: [],
    contact: { name: "Admin Desa Keseneng", role: "Pengelola potensi desa", email: "pemdes@keseneng.desa.id" },
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "kategori-potensi";
}
