import {
  createGalleryAlbumRecord,
  deleteGalleryAlbumRecord,
  isGalleryAlbumInput,
  listGalleryAlbumRecords,
  resetGalleryAlbumRecords,
  updateGalleryAlbumRecord,
  type GalleryAlbumInput,
} from "@/lib/gallery-store";
import { saveUploadedFile } from "@/lib/upload-files";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export async function GET() {
  const albums = await listGalleryAlbumRecords();

  return Response.json({
    data: albums,
    meta: { total: albums.length },
  });
}

export async function POST(request: Request) {
  const input = await parseAlbumInput(request);

  if (!input || !isGalleryAlbumInput(input)) {
    return Response.json({ error: "Data album galeri tidak valid." }, { status: 400 });
  }

  const album = await createGalleryAlbumRecord(input);

  if (!album) {
    return Response.json({ error: "Slug atau ID album galeri sudah dipakai." }, { status: 409 });
  }

  return Response.json({ data: album }, { status: 201 });
}

export async function PUT(request: Request) {
  const input = await parseAlbumInput(request);
  const idOrSlug = input?.id ?? input?.slug;

  if (!input || !idOrSlug || !isGalleryAlbumInput(input)) {
    return Response.json({ error: "Data album galeri tidak valid." }, { status: 400 });
  }

  const album = await updateGalleryAlbumRecord(idOrSlug, input);

  if (!album) {
    return Response.json({ error: "Album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: album });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") === "true") {
    const albums = await resetGalleryAlbumRecords();

    return Response.json({ data: albums, meta: { total: albums.length } });
  }

  const idOrSlug = searchParams.get("id") ?? searchParams.get("slug");

  if (!idOrSlug) {
    return Response.json({ error: "ID atau slug album wajib dikirim." }, { status: 400 });
  }

  const deleted = await deleteGalleryAlbumRecord(idOrSlug);

  if (!deleted) {
    return Response.json({ error: "Album galeri tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ data: deleted });
}

async function parseAlbumInput(request: Request) {
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = getText(formData, "title");
    let coverImage = getText(formData, "coverImage");

    if (file instanceof File && file.size > 0) {
      const uploaded = await saveUploadedFile({
        file,
        directory: "galeri",
        prefix: title || "album-galeri",
        allowedTypes: imageTypes,
        maxSize: maxImageSize,
      });

      if (!uploaded.ok) {
        return null;
      }

      coverImage = uploaded.data.url;
    }

    return {
      id: getText(formData, "id") || undefined,
      slug: getText(formData, "slug") || slugify(title || "album-galeri"),
      title,
      category: getText(formData, "category"),
      description: getText(formData, "description"),
      coverImage,
      updatedAt: getText(formData, "updatedAt") || undefined,
      photos: parsePhotos(getText(formData, "photosJson") || getText(formData, "photos")),
    } satisfies GalleryAlbumInput;
  }

  const body = await request.json().catch(() => null) as (GalleryAlbumInput & { photosJson?: string }) | null;

  if (!body) {
    return null;
  }

  return {
    ...body,
    photos: body.photos ?? parsePhotos(body.photosJson),
  } satisfies GalleryAlbumInput;
}

function parsePhotos(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "album-galeri";
}

