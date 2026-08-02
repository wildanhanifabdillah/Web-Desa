import {
  createArtType,
  deleteArtType,
  getArtType,
  isArtCultureStatus,
  isArtTypeInput,
  listArtTypes,
  updateArtType,
  type ArtTypeInput,
} from "@/lib/art-culture-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 3 * 1024 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? searchParams.get("slug");
  const status = searchParams.get("status");

  if (status && !isArtCultureStatus(status)) {
    return Response.json({ error: "Status jenis kesenian tidak valid." }, { status: 400 });
  }

  if (id) {
    const record = getArtType(id);

    if (!record) {
      return Response.json({ error: "Jenis kesenian tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  const records = listArtTypes(status && isArtCultureStatus(status) ? status : undefined);

  return Response.json({ data: records, meta: { total: records.length, status: status ?? null } });
}

export async function POST(request: Request) {
  const parsed = await parseArtTypeRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isArtTypeInput(parsed.input)) {
    return Response.json({ error: "Payload jenis kesenian belum lengkap atau tidak valid." }, { status: 400 });
  }

  const record = createArtType(parsed.input);

  if (!record) {
    return Response.json({ error: "Slug jenis kesenian sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: record, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseArtTypeRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const id = parsed.id ?? parsed.input.slug;

  if (!id) {
    return Response.json({ error: "ID atau slug jenis kesenian wajib dikirim." }, { status: 400 });
  }

  const record = updateArtType(id, parsed.input);

  if (!record) {
    return Response.json({ error: "Jenis kesenian tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? searchParams.get("slug");

  if (!id) {
    return Response.json({ error: "ID jenis kesenian wajib dikirim." }, { status: 400 });
  }

  const record = deleteArtType(id);

  if (!record) {
    return Response.json({ error: "Jenis kesenian tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

async function parseArtTypeRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form jenis kesenian tidak valid.", status: 400 };
    }

    return parseArtTypeFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload jenis kesenian wajib dikirim.", status: 400 };
  }

  const { id, ...input } = body as { id?: string } & Record<string, unknown>;

  return { ok: true as const, id, input: normalizeInput(input), upload: null };
}

async function parseArtTypeFormData(formData: FormData) {
  const name = getFormString(formData, "name") ?? "jenis-kesenian";
  const slug = getFormString(formData, "slug") ?? slugify(name);
  const file = formData.get("file");
  let imageUrl = getFormString(formData, "imageUrl") ?? "";
  let upload = null;

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({ file, directory: "seni-budaya", prefix: `jenis-${slug}`, allowedTypes: allowedImageTypes, maxSize: maxImageSize });

    if (!stored.ok) {
      return stored;
    }

    imageUrl = stored.data.url;
    upload = stored.data;
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: normalizeInput({
      slug,
      name,
      summary: getFormString(formData, "summary"),
      description: getFormString(formData, "description"),
      history: getFormString(formData, "history"),
      imageUrl,
      imageAlt: getFormString(formData, "imageAlt"),
      displayOrder: getFormString(formData, "displayOrder"),
      status: getFormString(formData, "status"),
    }),
    upload,
  };
}

function normalizeInput(input: Record<string, unknown>): ArtTypeInput {
  return {
    slug: typeof input.slug === "string" ? input.slug.trim() : "",
    name: typeof input.name === "string" ? input.name.trim() : "",
    summary: typeof input.summary === "string" ? input.summary.trim() : "",
    description: typeof input.description === "string" ? input.description.trim() : "",
    history: typeof input.history === "string" ? input.history.trim() : "",
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl.trim() : "",
    imageAlt: typeof input.imageAlt === "string" ? input.imageAlt.trim() : "",
    displayOrder: typeof input.displayOrder === "number" ? input.displayOrder : Number(input.displayOrder ?? 1),
    status: isArtCultureStatus(input.status) ? input.status : "draft",
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "jenis-kesenian";
}