import {
  createArtGroup,
  deleteArtGroup,
  getArtGroup,
  isArtCultureStatus,
  isArtGroupInput,
  listArtGroups,
  listArtTypes,
  updateArtGroup,
  type ArtGroupInput,
  type ArtGroupRecord,
} from "@/lib/art-culture-store";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 3 * 1024 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? searchParams.get("slug");
  const status = searchParams.get("status");
  const artType = searchParams.get("artType") ?? searchParams.get("jenis");

  if (status && !isArtCultureStatus(status)) {
    return Response.json({ error: "Status kelompok seni tidak valid." }, { status: 400 });
  }

  if (id) {
    const record = await getArtGroup(id);

    if (!record) {
      return Response.json({ error: "Kelompok seni tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: await decorateGroup(record) });
  }

  const filteredRecords = (await listArtGroups(status && isArtCultureStatus(status) ? status : undefined))
    .filter((group) => artType ? group.artTypeIds.includes(artType) : true);
  const records = await Promise.all(filteredRecords.map(decorateGroup));

  return Response.json({ data: records, meta: { total: records.length, status: status ?? null, artType: artType ?? null } });
}

export async function POST(request: Request) {
  const parsed = await parseArtGroupRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isArtGroupInput(parsed.input)) {
    return Response.json({ error: "Payload kelompok seni belum lengkap atau tidak valid." }, { status: 400 });
  }

  const record = await createArtGroup(parsed.input);

  if (!record) {
    return Response.json({ error: "Slug kelompok seni sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: await decorateGroup(record), meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseArtGroupRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  const id = parsed.id ?? parsed.input.slug;

  if (!id) {
    return Response.json({ error: "ID atau slug kelompok seni wajib dikirim." }, { status: 400 });
  }

  const record = await updateArtGroup(id, parsed.input);

  if (!record) {
    return Response.json({ error: "Kelompok seni tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: await decorateGroup(record), meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? searchParams.get("slug");

  if (!id) {
    return Response.json({ error: "ID kelompok seni wajib dikirim." }, { status: 400 });
  }

  const record = await deleteArtGroup(id);

  if (!record) {
    return Response.json({ error: "Kelompok seni tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: await decorateGroup(record) });
}

async function parseArtGroupRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form kelompok seni tidak valid.", status: 400 };
    }

    return parseArtGroupFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload kelompok seni wajib dikirim.", status: 400 };
  }

  const { id, ...input } = body as { id?: string } & Record<string, unknown>;

  return { ok: true as const, id, input: normalizeInput(input), upload: null };
}

async function parseArtGroupFormData(formData: FormData) {
  const name = getFormString(formData, "name") ?? "kelompok-seni";
  const slug = getFormString(formData, "slug") ?? slugify(name);
  const file = formData.get("file");
  let imageUrl = getFormString(formData, "imageUrl") ?? "";
  let upload = null;

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({ file, directory: "seni-budaya", prefix: `kelompok-${slug}`, allowedTypes: allowedImageTypes, maxSize: maxImageSize });

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
      artTypeIds: getFormString(formData, "artTypeIds"),
      foundedHistory: getFormString(formData, "foundedHistory"),
      performanceManagement: getFormString(formData, "performanceManagement"),
      memberCount: getFormString(formData, "memberCount"),
      tariffMin: getFormString(formData, "tariffMin"),
      tariffMax: getFormString(formData, "tariffMax"),
      contactName: getFormString(formData, "contactName"),
      contactPhone: getFormString(formData, "contactPhone"),
      imageUrl,
      imageAlt: getFormString(formData, "imageAlt"),
      displayOrder: getFormString(formData, "displayOrder"),
      status: getFormString(formData, "status"),
    }),
    upload,
  };
}

async function decorateGroup(group: ArtGroupRecord) {
  const types = await listArtTypes();

  return {
    ...group,
    artTypeLabels: types.filter((type) => group.artTypeIds.includes(type.id)).map((type) => type.name),
  };
}

function normalizeInput(input: Record<string, unknown>): ArtGroupInput {
  return {
    slug: typeof input.slug === "string" ? input.slug.trim() : "",
    name: typeof input.name === "string" ? input.name.trim() : "",
    artTypeIds: parseArtTypeIds(input.artTypeIds),
    foundedHistory: typeof input.foundedHistory === "string" ? input.foundedHistory.trim() : "",
    performanceManagement: typeof input.performanceManagement === "string" ? input.performanceManagement.trim() : "",
    memberCount: typeof input.memberCount === "number" ? input.memberCount : Number(input.memberCount ?? 0),
    tariffMin: typeof input.tariffMin === "number" ? input.tariffMin : Number(input.tariffMin ?? 0),
    tariffMax: typeof input.tariffMax === "number" ? input.tariffMax : Number(input.tariffMax ?? 0),
    contactName: typeof input.contactName === "string" ? input.contactName.trim() : "",
    contactPhone: typeof input.contactPhone === "string" ? input.contactPhone.trim() : "",
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl.trim() : "",
    imageAlt: typeof input.imageAlt === "string" ? input.imageAlt.trim() : "",
    displayOrder: typeof input.displayOrder === "number" ? input.displayOrder : Number(input.displayOrder ?? 1),
    status: isArtCultureStatus(input.status) ? input.status : "draft",
  };
}

function parseArtTypeIds(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      return [];
    }
  }

  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "kelompok-seni";
}