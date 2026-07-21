import {
  createPotentialItem,
  deletePotentialItem,
  getPotentialItem,
  isPotentialItemInput,
  listPotentialItems,
  resetPotentialItems,
  updatePotentialItem,
  type PotentialItemInput,
} from "@/lib/potential-item-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 3 * 1024 * 1024;

export async function GET(request: Request) {
  const items = await listPotentialItems();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const category = searchParams.get("category")?.trim().toLowerCase();
  const status = searchParams.get("status")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (id) {
    const item = await getPotentialItem(id);

    if (!item) {
      return Response.json({ error: "Item potensi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: item });
  }

  const filteredItems = items.filter((item) => {
    const matchCategory = category ? item.categorySlug === category : true;
    const matchStatus = status ? item.status === status : true;
    const matchQuery = query
      ? [item.title, item.summary, item.description, item.categorySlug]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchCategory && matchStatus && matchQuery;
  });

  return Response.json({
    data: filteredItems,
    meta: {
      total: filteredItems.length,
      category: category ?? null,
      status: status ?? null,
      query: query ?? null,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parsePotentialItemRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isPotentialItemInput(parsed.input)) {
    return Response.json(
      { error: "Payload item potensi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const item = await createPotentialItem(parsed.input);

  if (!item) {
    return Response.json({ error: "Slug item potensi sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: item, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parsePotentialItemRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const id = parsed.id ?? parsed.input.slug;

  if (!id) {
    return Response.json({ error: "ID atau slug item potensi wajib dikirim." }, { status: 400 });
  }

  const item = await updatePotentialItem(id, parsed.input);

  if (!item) {
    return Response.json({ error: "Item potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: item, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const items = await resetPotentialItems();

    return Response.json({ data: items, meta: { total: items.length } });
  }

  const id = searchParams.get("id")?.trim() ?? searchParams.get("slug")?.trim();

  if (!id) {
    return Response.json({ error: "ID atau slug item potensi wajib dikirim." }, { status: 400 });
  }

  const item = await deletePotentialItem(id);

  if (!item) {
    return Response.json({ error: "Item potensi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: item });
}

async function parsePotentialItemRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form upload item potensi tidak valid.", status: 400 };
    }

    return parsePotentialItemFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload item potensi wajib dikirim.", status: 400 };
  }

  const candidate = body as Partial<PotentialItemInput> & { id?: string };

  return {
    ok: true as const,
    id: candidate.id,
    input: candidate,
    upload: null,
  };
}

async function parsePotentialItemFormData(formData: FormData) {
  const file = formData.get("file");
  const title = getFormString(formData, "title") ?? "potensi-desa";
  const slug = getFormString(formData, "slug") ?? slugify(title);
  const categorySlug = getFormString(formData, "categorySlug") ?? getFormString(formData, "category");
  const imageUrl = getFormString(formData, "image") ?? getFormString(formData, "imageUrl");

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File foto item potensi tidak valid.", status: 400 };
  }

  if (file instanceof File) {
    if (!allowedImageTypes.has(file.type)) {
      return { ok: false as const, error: "Foto item potensi harus JPG, PNG, atau WebP.", status: 415 };
    }

    if (file.size > maxImageSize) {
      return { ok: false as const, error: "Ukuran foto item potensi maksimal 3 MB.", status: 413 };
    }
  }

  let generatedUrl = imageUrl;
  let upload = null;

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "potensi",
      prefix: `${categorySlug ?? "item"}-${slug ?? "foto"}`,
      allowedTypes: allowedImageTypes,
      maxSize: maxImageSize,
    });

    if (!stored.ok) {
      return stored;
    }

    generatedUrl = stored.data.url;
    upload = stored.data;
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: {
      categorySlug: categorySlug ?? "",
      title: getFormString(formData, "title") ?? "",
      slug: slug ?? "",
      summary: getFormString(formData, "summary") ?? "",
      description: getFormString(formData, "description") ?? "",
      image: generatedUrl ?? "",
      imageAlt: getFormString(formData, "imageAlt") ?? getFormString(formData, "image_alt") ?? "",
      status: normalizeItemStatus(getFormString(formData, "status")),
      publishedAt: getFormString(formData, "publishedAt") ?? getFormString(formData, "published_at"),
    },
    upload,
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeItemStatus(value: string | null): PotentialItemInput["status"] {
  if (value === "draft" || value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "potensi-desa";
}
