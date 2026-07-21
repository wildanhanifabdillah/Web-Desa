import {
  createGalleryVideoRecord,
  deleteGalleryVideoRecord,
  isGalleryVideoInput,
  listGalleryVideoRecords,
  resetGalleryVideoRecords,
  updateGalleryVideoRecord,
  type GalleryVideoInput,
} from "@/lib/gallery-store";
import { saveUploadedFile } from "@/lib/upload-files";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export async function GET() {
  const videos = await listGalleryVideoRecords();

  return Response.json({ data: videos, meta: { total: videos.length } });
}

export async function POST(request: Request) {
  const input = await parseVideoInput(request);

  if (!input || !isGalleryVideoInput(input)) {
    return Response.json({ error: "Data video galeri tidak valid." }, { status: 400 });
  }

  const video = await createGalleryVideoRecord(input);

  if (!video) {
    return Response.json({ error: "ID video galeri sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: video }, { status: 201 });
}

export async function PUT(request: Request) {
  const input = await parseVideoInput(request);
  const id = input?.id;

  if (!input || !id || !isGalleryVideoInput(input)) {
    return Response.json({ error: "Data video galeri tidak valid." }, { status: 400 });
  }

  const video = await updateGalleryVideoRecord(id, input);

  if (!video) {
    return Response.json({ error: "Video galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: video });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const videos = await resetGalleryVideoRecords();

    return Response.json({ data: videos, meta: { total: videos.length } });
  }

  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID video wajib dikirim." }, { status: 400 });
  }

  const deleted = await deleteGalleryVideoRecord(id);

  if (!deleted) {
    return Response.json({ error: "Video galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: deleted });
}

async function parseVideoInput(request: Request) {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = getText(formData, "title");
    let thumbnail = getText(formData, "thumbnail");

    if (file instanceof File && file.size > 0) {
      const uploaded = await saveUploadedFile({
        file,
        directory: "galeri",
        prefix: title || "video-galeri",
        allowedTypes: imageTypes,
        maxSize: maxImageSize,
      });

      if (!uploaded.ok) {
        return null;
      }

      thumbnail = uploaded.data.url;
    }

    return {
      id: getText(formData, "id") || undefined,
      title,
      description: getText(formData, "description"),
      thumbnail,
      duration: getText(formData, "duration"),
      publishedAt: getText(formData, "publishedAt"),
    } satisfies GalleryVideoInput;
  }

  return await request.json().catch(() => null) as GalleryVideoInput | null;
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}
