import { saveUploadedFile } from "@/lib/upload-files";

const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);
const maxDocumentSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return Response.json(
      { error: "Gunakan multipart/form-data untuk upload file dokumen." },
      { status: 415 },
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json({ error: "Form upload dokumen tidak valid." }, { status: 400 });
  }

  const documentSlug = formData.get("documentSlug") ?? formData.get("slug");
  const file = formData.get("file");

  if (typeof documentSlug !== "string" || documentSlug.trim().length === 0) {
    return Response.json({ error: "documentSlug wajib dikirim." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return Response.json({ error: "File dokumen wajib dikirim." }, { status: 400 });
  }

  const stored = await saveUploadedFile({
    file,
    directory: "dokumen",
    prefix: documentSlug,
    allowedTypes: allowedDocumentTypes,
    maxSize: maxDocumentSize,
  });

  if (!stored.ok) {
    return Response.json({ error: stored.error }, { status: stored.status });
  }

  return Response.json({
    data: {
      documentSlug: documentSlug.trim().toLowerCase(),
      ...stored.data,
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("fileName");
  const url = searchParams.get("url");
  const target = fileName ?? url?.split("/").pop() ?? null;

  if (!target) {
    return Response.json({ error: "fileName atau url wajib dikirim." }, { status: 400 });
  }

  return Response.json({
    data: {
      fileName: target,
      deleted: true,
    },
  });
}
