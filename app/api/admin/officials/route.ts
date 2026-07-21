import {
  createOfficialRecord,
  deleteOfficialRecord,
  getOfficialRecord,
  isOfficialInput,
  listOfficialRecords,
  resetOfficialRecords,
  updateOfficialRecord,
  type ProfileOfficialInput,
} from "@/lib/profile-officials";
import { saveUploadedFile } from "@/lib/upload-files";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxPhotoSize = 2 * 1024 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const area = searchParams.get("area")?.trim().toLowerCase();
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (id) {
    const record = getOfficialRecord(id);

    if (!record) {
      return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ data: record });
  }

  const records = listOfficialRecords().filter((record) => {
    const matchesArea = area ? record.area.toLowerCase() === area : true;
    const matchesQuery = query
      ? [record.name, record.role, record.focus, record.contact, record.area]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesArea && matchesQuery;
  });

  return Response.json({
    data: records,
    meta: {
      total: records.length,
      areas: Array.from(new Set(listOfficialRecords().map((record) => record.area))),
      area: area ?? null,
      query: query ?? null,
    },
  });
}

export async function POST(request: Request) {
  const parsed = await parseOfficialRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!isOfficialInput(parsed.input)) {
    return Response.json(
      { error: "Payload perangkat desa belum lengkap atau tidak valid." },
      { status: 400 },
    );
  }

  const record = createOfficialRecord(parsed.input);

  return Response.json({ data: record, meta: parsed.upload }, { status: 201 });
}

export async function PUT(request: Request) {
  const parsed = await parseOfficialRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (!parsed.id) {
    return Response.json({ error: "ID perangkat desa wajib dikirim." }, { status: 400 });
  }

  const record = updateOfficialRecord(parsed.id, parsed.input);

  if (!record) {
    return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record, meta: parsed.upload });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const records = resetOfficialRecords();

    return Response.json({ data: records, meta: { total: records.length } });
  }

  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID perangkat desa wajib dikirim." }, { status: 400 });
  }

  const record = deleteOfficialRecord(id);

  if (!record) {
    return Response.json({ error: "Perangkat desa tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: record });
}

async function parseOfficialRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form perangkat desa tidak valid.", status: 400 };
    }

    return parseOfficialFormData(formData);
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "Payload perangkat desa wajib dikirim.", status: 400 };
  }

  const { id, ...input } = body as { id?: string } & Record<string, unknown>;

  return {
    ok: true as const,
    id,
    input: normalizeOfficialInput(input),
    upload: null,
  };
}

async function parseOfficialFormData(formData: FormData) {
  const file = formData.get("photoFile") ?? formData.get("file");
  const name = getFormString(formData, "name") ?? "perangkat-desa";
  let photoUrl = getFormString(formData, "photoUrl") ?? undefined;
  const deletePhoto = getFormBoolean(formData, "deletePhoto");
  let upload = null;

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File foto perangkat tidak valid.", status: 400 };
  }

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "perangkat-desa",
      prefix: name,
      allowedTypes: allowedImageTypes,
      maxSize: maxPhotoSize,
    });

    if (!stored.ok) {
      return stored;
    }

    photoUrl = stored.data.url;
    upload = stored.data;
  } else if (deletePhoto) {
    photoUrl = "";
  }

  return {
    ok: true as const,
    id: getFormString(formData, "id") ?? undefined,
    input: normalizeOfficialInput({
      name,
      role: getFormString(formData, "role"),
      focus: getFormString(formData, "focus"),
      contact: getFormString(formData, "contact"),
      area: getFormString(formData, "area"),
      displayOrder: getFormString(formData, "displayOrder"),
      photoUrl,
      photoAlt: deletePhoto && !upload ? "" : getFormString(formData, "photoAlt") ?? `Foto ${name}`,
    }),
    upload,
  };
}

function normalizeOfficialInput(input: Record<string, unknown>): Partial<ProfileOfficialInput> {
  const displayOrder = typeof input.displayOrder === "number"
    ? input.displayOrder
    : Number(input.displayOrder ?? 1);

  return {
    name: typeof input.name === "string" ? input.name.trim() : "",
    role: typeof input.role === "string" ? input.role.trim() : "",
    focus: typeof input.focus === "string" ? input.focus.trim() : "",
    contact: typeof input.contact === "string" ? input.contact.trim() : "",
    area: typeof input.area === "string" ? input.area.trim() : "",
    displayOrder,
    photoUrl: typeof input.photoUrl === "string" ? input.photoUrl.trim() : undefined,
    photoAlt: typeof input.photoAlt === "string" ? input.photoAlt.trim() : undefined,
  };
}

function getFormBoolean(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  return value === "true" || value === "on" || value === "1";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

