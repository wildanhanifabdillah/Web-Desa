import {
  createGalleryPhotoRecord,
  deleteGalleryPhotoRecord,
  getGalleryAlbumRecord,
  updateGalleryPhotoRecord,
} from "@/lib/gallery-store";
import { saveUploadedFile } from "@/lib/upload-files";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get("album");

  if (!albumSlug) {
    return Response.json({ error: "Slug album wajib dikirim." }, { status: 400 });
  }

  const album = await getGalleryAlbumRecord(albumSlug);

  if (!album) {
    return Response.json({ error: "Album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({
    data: album.photos,
    meta: { album: album.slug, total: album.photos.length },
  });
}

export async function POST(request: Request) {
  const input = await parsePhotoInput(request);

  if (!input?.album || !isPhotoPayload(input)) {
    return Response.json({ error: "Data foto galeri tidak valid." }, { status: 400 });
  }

  const result = await createGalleryPhotoRecord(input.album, input);

  if (!result) {
    return Response.json({ error: "Album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: result.photo, meta: { album: result.album.slug } }, { status: 201 });
}

export async function PUT(request: Request) {
  const input = await parsePhotoInput(request);

  if (!input?.album || !input.id || !isPhotoPayload(input)) {
    return Response.json({ error: "Data foto galeri tidak valid." }, { status: 400 });
  }

  const result = await updateGalleryPhotoRecord(input.album, input.id, input);

  if (!result) {
    return Response.json({ error: "Foto atau album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: result.photo, meta: { album: result.album.slug } });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get("album");
  const photoId = searchParams.get("id");

  if (!albumSlug || !photoId) {
    return Response.json({ error: "Slug album dan ID foto wajib dikirim." }, { status: 400 });
  }

  const result = await deleteGalleryPhotoRecord(albumSlug, photoId);

  if (!result) {
    return Response.json({ error: "Foto atau album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: result.photo, meta: { album: result.album.slug } });
}

type PhotoPayload = {
  album: string;
  id?: string;
  title: string;
  description: string;
  image: string;
  takenAt: string;
};

async function parsePhotoInput(request: Request): Promise<PhotoPayload | null> {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const album = getText(formData, "album");
    const title = getText(formData, "title");
    let image = getText(formData, "image");

    if (file instanceof File && file.size > 0) {
      const uploaded = await saveUploadedFile({
        file,
        directory: "galeri",
        prefix: `${album}-${title}`,
        allowedTypes: imageTypes,
        maxSize: maxImageSize,
      });

      if (!uploaded.ok) {
        return null;
      }

      image = uploaded.data.url;
    }

    return {
      album,
      id: getText(formData, "id") || undefined,
      title,
      description: getText(formData, "description"),
      image,
      takenAt: getText(formData, "takenAt"),
    };
  }

  return await request.json().catch(() => null) as PhotoPayload | null;
}

function isPhotoPayload(value: PhotoPayload) {
  return [value.album, value.title, value.description, value.image, value.takenAt].every(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}
