const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxPhotoSize = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return Response.json(
      { error: "Gunakan multipart/form-data untuk upload foto perangkat desa." },
      { status: 415 },
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json({ error: "Form upload tidak valid." }, { status: 400 });
  }

  const officialId = formData.get("officialId");
  const photo = formData.get("photo");

  if (typeof officialId !== "string" || officialId.trim().length === 0) {
    return Response.json({ error: "officialId wajib dikirim." }, { status: 400 });
  }

  if (!(photo instanceof File)) {
    return Response.json({ error: "File photo wajib dikirim." }, { status: 400 });
  }

  if (!allowedImageTypes.has(photo.type)) {
    return Response.json(
      { error: "Format foto harus JPG, PNG, atau WebP." },
      { status: 400 },
    );
  }

  if (photo.size > maxPhotoSize) {
    return Response.json(
      { error: "Ukuran foto maksimal 2 MB." },
      { status: 400 },
    );
  }

  const extension = getFileExtension(photo.name, photo.type);
  const fileName = `${officialId.trim()}-${Date.now()}.${extension}`;

  return Response.json({
    data: {
      officialId: officialId.trim(),
      fileName,
      originalName: photo.name,
      mimeType: photo.type,
      size: photo.size,
      url: `/uploads/perangkat-desa/${fileName}`,
    },
  });
}

function getFileExtension(fileName: string, mimeType: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}
