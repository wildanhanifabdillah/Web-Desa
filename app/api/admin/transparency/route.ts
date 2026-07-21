import {
  createTransparencyRecord,
  deleteTransparencyRecord,
  getTransparencyRecord,
  isTransparencyDocumentInput,
  listTransparencyRecords,
  resetTransparencyRecords,
  updateTransparencyRecord,
} from "@/lib/transparency-store";
import type { TransparencyDocumentInput } from "@/lib/transparency-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedPdfTypes = new Set(["application/pdf"]);
const maxPdfSize = 10 * 1024 * 1024;

export async function GET(request: Request) {
  const records = await listTransparencyRecords();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");

  if (idOrSlug) {
    const record = await getTransparencyRecord(idOrSlug);

    if (!record) {
      return Response.json({ error: "Dokumen transparansi tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  const filteredRecords = query
    ? records.filter((record) =>
        [record.title, record.slug, record.category, record.description, record.status]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : records;

  return Response.json({
    data: filteredRecords,
    meta: {
      total: filteredRecords.length,
      query: query ?? null,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parseTransparencyRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isTransparencyDocumentInput(parsed.input)) {
    return Response.json(
      { error: "Payload dokumen transparansi belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = await createTransparencyRecord(parsed.input);

  if (!record) {
    return Response.json({ error: "Slug dokumen transparansi sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: record, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseTransparencyRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const idOrSlug = parsed.id ?? parsed.input.slug;

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug dokumen wajib dikirim." }, { status: 400 });
  }

  const record = await updateTransparencyRecord(idOrSlug, parsed.input);

  if (!record) {
    return Response.json({ error: "Dokumen transparansi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    const records = await resetTransparencyRecords();

    return Response.json({ data: records, meta: { total: records.length } });
  }

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug dokumen wajib dikirim." }, { status: 400 });
  }

  const record = await deleteTransparencyRecord(idOrSlug);

  if (!record) {
    return Response.json({ error: "Dokumen transparansi tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

async function parseTransparencyRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form dokumen transparansi tidak valid.", status: 400 };
    }

    return parseTransparencyFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload dokumen transparansi wajib dikirim.", status: 400 };
  }

  const candidate = body as TransparencyDocumentInput & { id?: string };

  return { ok: true as const, id: candidate.id, input: candidate, upload: null };
}

async function parseTransparencyFormData(formData: FormData) {
  const file = formData.get("file");
  const title = getFormString(formData, "title") ?? "dokumen-transparansi";
  const slug = getFormString(formData, "slug") ?? slugify(title);
  let fileUrl = getFormString(formData, "fileUrl") ?? undefined;
  let fileType = getFormString(formData, "fileType") ?? "PDF";
  let fileSize = getFormString(formData, "fileSize") ?? "1 MB";
  let upload = null;

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File PDF tidak valid.", status: 400 };
  }

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "dokumen",
      prefix: slug,
      allowedTypes: allowedPdfTypes,
      maxSize: maxPdfSize,
    });

    if (!stored.ok) {
      return stored;
    }

    fileUrl = stored.data.url;
    fileType = stored.data.fileType;
    fileSize = stored.data.sizeLabel;
    upload = stored.data;
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: {
      slug: slug ?? "",
      title: getFormString(formData, "title") ?? "",
      category: getFormString(formData, "category") ?? "",
      year: Number(getFormString(formData, "year") ?? new Date().getFullYear()),
      description: getFormString(formData, "description") ?? "",
      fileType,
      fileSize,
      fileUrl,
      publishedAt: getFormString(formData, "publishedAt") ?? new Date().toISOString(),
      status: normalizeTransparencyStatus(getFormString(formData, "status")),
    },
    upload,
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeTransparencyStatus(value: string | null): TransparencyDocumentInput["status"] {
  return value === "Dipublikasikan" ? "Dipublikasikan" : "Draf";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "dokumen-transparansi";
}
