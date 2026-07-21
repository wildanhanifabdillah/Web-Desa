import { saveUploadedFile } from "@/lib/upload-files";

const allowedMediaTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxMediaSize = 3 * 1024 * 1024;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return Response.json(
      { error: "Gunakan multipart/form-data untuk upload media potensi." },
      { status: 415 },
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json({ error: "Form upload media tidak valid." }, { status: 400 });
  }

  const categorySlug = formData.get("categorySlug");
  const media = formData.get("media");

  if (typeof categorySlug !== "string" || categorySlug.trim().length === 0) {
    return Response.json({ error: "categorySlug wajib dikirim." }, { status: 400 });
  }

  if (!(media instanceof File)) {
    return Response.json({ error: "File media wajib dikirim." }, { status: 400 });
  }

  const stored = await saveUploadedFile({
    file: media,
    directory: "potensi",
    prefix: categorySlug,
    allowedTypes: allowedMediaTypes,
    maxSize: maxMediaSize,
  });

  if (!stored.ok) {
    return Response.json({ error: stored.error }, { status: stored.status });
  }

  return Response.json({
    data: {
      categorySlug: categorySlug.trim().toLowerCase(),
      ...stored.data,
    },
  });
}
