import {
  createVillageRegulationRecord,
  deleteVillageRegulationRecord,
  getVillageRegulationRecord,
  isVillageRegulationInput,
  isVillageRegulationStatus,
  listVillageRegulationRecords,
  resetVillageRegulationRecords,
  updateVillageRegulationRecord,
  type VillageRegulationInput,
} from "@/lib/village-regulation-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedPdfTypes = new Set(["application/pdf"]);
const maxPdfSize = 10 * 1024 * 1024;

export async function GET(request: Request) {
  const records = await listVillageRegulationRecords();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? searchParams.get("query")?.trim().toLowerCase();
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const category = searchParams.get("category")?.trim().toLowerCase();
  const status = searchParams.get("status");
  const yearValue = searchParams.get("year");

  if (status && !isVillageRegulationStatus(status)) {
    return Response.json({ error: "Status dokumen tidak valid." }, { status: 400 });
  }

  const year = yearValue ? Number.parseInt(yearValue, 10) : null;

  if (yearValue && (!Number.isInteger(year) || year?.toString() !== yearValue.trim())) {
    return Response.json({ error: "Tahun dokumen harus angka bulat." }, { status: 400 });
  }

  if (idOrSlug) {
    const record = await getVillageRegulationRecord(idOrSlug);

    if (!record) {
      return Response.json({ error: "Dokumen desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  const filteredRecords = records.filter((record) => {
    const matchesQuery = query
      ? [record.title, record.slug, record.number, record.category, record.summary, record.status]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesCategory = category ? record.category.toLowerCase() === category : true;
    const matchesStatus = status ? record.status === status : true;
    const matchesYear = year ? record.year === year : true;

    return matchesQuery && matchesCategory && matchesStatus && matchesYear;
  });

  return Response.json({
    data: filteredRecords,
    meta: {
      total: filteredRecords.length,
      active: filteredRecords.filter((record) => record.status === "Berlaku").length,
      archived: filteredRecords.filter((record) => record.status === "Arsip").length,
      query: query ?? null,
      category: category ?? null,
      status: status ?? null,
      year,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parseDocumentRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isVillageRegulationInput(parsed.input)) {
    return Response.json(
      { error: "Payload dokumen desa belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = await createVillageRegulationRecord(parsed.input);

  if (!record) {
    return Response.json({ error: "Slug dokumen desa sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: record, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseDocumentRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const idOrSlug = parsed.id ?? parsed.input.slug;

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug dokumen wajib dikirim." }, { status: 400 });
  }

  const record = await updateVillageRegulationRecord(idOrSlug, parsed.input);

  if (!record) {
    return Response.json({ error: "Dokumen desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");
  const reset = searchParams.get("reset") === "true";

  if (reset) {
    const records = await resetVillageRegulationRecords();

    return Response.json({ data: records, meta: { total: records.length } });
  }

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug dokumen wajib dikirim." }, { status: 400 });
  }

  const record = await deleteVillageRegulationRecord(idOrSlug);

  if (!record) {
    return Response.json({ error: "Dokumen desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

async function parseDocumentRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form dokumen tidak valid.", status: 400 };
    }

    return parseDocumentFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload dokumen desa wajib dikirim.", status: 400 };
  }

  const candidate = body as VillageRegulationInput & { id?: string };

  return { ok: true as const, id: candidate.id, input: normalizeDocumentInput(candidate), upload: null };
}

async function parseDocumentFormData(formData: FormData) {
  const file = formData.get("file");
  const title = getFormString(formData, "title") ?? "dokumen-desa";
  const slug = getFormString(formData, "slug") ?? slugify(title);
  let fileType = getFormString(formData, "fileType") ?? "PDF";
  let fileSize = getFormString(formData, "fileSize") ?? "1 MB";
  let fileUrl = getFormString(formData, "fileUrl") ?? undefined;
  let upload = null;
  const statusValue = getFormString(formData, "status");
  const status = isVillageRegulationStatus(statusValue) ? statusValue : undefined;

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

    fileType = stored.data.fileType;
    fileSize = stored.data.sizeLabel;
    fileUrl = stored.data.url;
    upload = stored.data;
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: normalizeDocumentInput({
      slug,
      number: getFormString(formData, "number") ?? undefined,
      title,
      year: Number(getFormString(formData, "year") ?? new Date().getFullYear()),
      category: getFormString(formData, "category") ?? undefined,
      summary: getFormString(formData, "summary") ?? undefined,
      fileUrl,
      fileType,
      fileSize,
      enactedAt: getFormString(formData, "enactedAt") ?? new Date().toISOString().slice(0, 10),
      status,
    }),
    upload,
  };
}

function normalizeDocumentInput(input: Partial<VillageRegulationInput>) {
  return {
    ...input,
    slug: input.slug?.trim() || slugify(input.title ?? "dokumen-desa"),
    number: input.number?.trim() ?? "",
    title: input.title?.trim() ?? "",
    year: typeof input.year === "number" ? input.year : Number(input.year ?? new Date().getFullYear()),
    category: input.category?.trim() ?? "",
    summary: input.summary?.trim() ?? "",
    fileUrl: input.fileUrl?.trim() || undefined,
    fileType: input.fileType?.trim() || "PDF",
    fileSize: input.fileSize?.trim() || "1 MB",
    enactedAt: input.enactedAt?.trim() ?? new Date().toISOString().slice(0, 10),
    status: isVillageRegulationStatus(input.status) ? input.status : "Berlaku",
  };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "dokumen-desa";
}






