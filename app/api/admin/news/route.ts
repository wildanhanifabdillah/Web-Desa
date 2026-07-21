import {
  createAdminNews,
  deleteAdminNews,
  getAdminNews,
  isNewsStatus,
  listAdminNews,
  resetAdminNews,
  updateAdminNews,
  type AdminNewsInput,
} from "@/lib/admin-news-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 3 * 1024 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const status = searchParams.get("status");
  const limitValue = searchParams.get("limit");

  if (status && !isNewsStatus(status)) {
    return Response.json({ error: "Status berita tidak valid." }, { status: 400 });
  }

  let limit: number | undefined;

  if (limitValue) {
    const parsedLimit = Number.parseInt(limitValue, 10);

    if (
      !Number.isInteger(parsedLimit)
      || parsedLimit.toString() !== limitValue.trim()
      || parsedLimit < 1
    ) {
      return Response.json({ error: "Limit berita harus angka bulat positif." }, { status: 400 });
    }

    limit = parsedLimit;
  }

  if (idOrSlug) {
    const item = await getAdminNews(idOrSlug);

    if (!item) {
      return Response.json({ error: "Berita tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: item });
  }

  const items = await listAdminNews({
    query: searchParams.get("q") ?? searchParams.get("query") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    status: status && isNewsStatus(status) ? status : undefined,
    limit,
  });

  return Response.json({
    data: items,
    meta: {
      total: items.length,
      published: items.filter((item) => item.status === "published").length,
      draft: items.filter((item) => item.status === "draft").length,
      archived: items.filter((item) => item.status === "archived").length,
      aiGenerated: items.filter((item) => item.isAiGenerated).length,
      query: searchParams.get("q") ?? searchParams.get("query") ?? null,
      category: searchParams.get("category") ?? null,
      status: status ?? null,
      limit: limit ?? null,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parseNewsRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const result = await createAdminNews(parsed.input);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ data: result.data, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseNewsRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const idOrSlug = parsed.id ?? parsed.input.slug;

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug berita wajib dikirim." }, { status: 400 });
  }

  const result = await updateAdminNews(idOrSlug, parsed.input);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({ data: result.data, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const items = await resetAdminNews();

    return Response.json({ data: items, meta: { total: items.length } });
  }

  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug berita wajib dikirim." }, { status: 400 });
  }

  const deleted = await deleteAdminNews(idOrSlug);

  if (!deleted) {
    return Response.json({ error: "Berita tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: deleted });
}

async function parseNewsRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form berita tidak valid.", status: 400 };
    }

    return parseNewsFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload berita wajib dikirim.", status: 400 };
  }

  const candidate = body as AdminNewsInput & { id?: string };

  return { ok: true as const, id: candidate.id, input: candidate, upload: null };
}

async function parseNewsFormData(formData: FormData) {
  const file = formData.get("file");
  const galleryFiles = formData.getAll("galleryFiles");
  const slug = getFormString(formData, "slug");
  const title = getFormString(formData, "title") ?? "berita";
  let imageUrl = getFormString(formData, "imageUrl");
  let upload = null;
  const galleryImages = [];

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File gambar berita tidak valid.", status: 400 };
  }

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "berita",
      prefix: slug ?? title,
      allowedTypes: allowedImageTypes,
      maxSize: maxImageSize,
    });

    if (!stored.ok) {
      return stored;
    }

    imageUrl = stored.data.url;
    upload = stored.data;
  }

  for (const galleryFile of galleryFiles) {
    if (!(galleryFile instanceof File) || galleryFile.size === 0) {
      continue;
    }

    const stored = await saveUploadedFile({
      file: galleryFile,
      directory: "berita",
      prefix: `${slug ?? title}-galeri`,
      allowedTypes: allowedImageTypes,
      maxSize: maxImageSize,
    });

    if (!stored.ok) {
      return stored;
    }

    galleryImages.push({
      id: crypto.randomUUID(),
      url: stored.data.url,
      alt: `Foto tambahan ${title}`,
      caption: "",
      order: galleryImages.length + 1,
      uploadedAt: new Date().toISOString(),
    });
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: {
      title,
      slug: slug ?? "",
      excerpt: getFormString(formData, "excerpt") ?? "",
      content: getFormString(formData, "content") ?? "",
      category: getFormString(formData, "category") ?? "",
      imageUrl: imageUrl ?? undefined,
      imageAlt: getFormString(formData, "imageAlt") ?? "",
      ...(galleryImages.length > 0 ? { galleryImages } : {}),
      publishedAt: getFormString(formData, "publishedAt"),
      authorName: getFormString(formData, "authorName") ?? "Admin Desa Keseneng",
      isAiGenerated: getFormBoolean(formData, "isAiGenerated"),
      status: normalizeNewsStatus(getFormString(formData, "status")),
    },
    upload,
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getFormBoolean(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  return value === "true" ? true : value === "false" ? false : undefined;
}

function normalizeNewsStatus(value: string | null): AdminNewsInput["status"] {
  return isNewsStatus(value) ? value : "draft";
}

