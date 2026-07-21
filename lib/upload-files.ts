import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredUpload = {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeLabel: string;
  url: string;
  fileType: string;
};

export async function saveUploadedFile({
  file,
  directory,
  prefix,
  allowedTypes,
  maxSize,
}: {
  file: File;
  directory: string;
  prefix: string;
  allowedTypes: Set<string>;
  maxSize: number;
}) {
  if (!allowedTypes.has(file.type)) {
    return { ok: false as const, status: 415, error: "Format file tidak didukung." };
  }

  if (file.size > maxSize) {
    return { ok: false as const, status: 413, error: `Ukuran file maksimal ${formatFileSize(maxSize)}.` };
  }

  const extension = getExtension(file.name, file.type);
  const safePrefix = slugifyFileName(prefix || "upload");
  const fileName = `${safePrefix}-${Date.now()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", directory);
  const targetPath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    ok: true as const,
    data: {
      fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      sizeLabel: formatFileSize(file.size),
      url: `/uploads/${directory}/${fileName}`,
      fileType: extension.toUpperCase(),
    } satisfies StoredUpload,
  };
}

export function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${size} B`;
}

function getExtension(fileName: string, mimeType: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "xls", "xlsx", "txt"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType.includes("wordprocessingml")) {
    return "docx";
  }

  if (mimeType.includes("spreadsheetml")) {
    return "xlsx";
  }

  if (mimeType === "application/msword") {
    return "doc";
  }

  if (mimeType === "application/vnd.ms-excel") {
    return "xls";
  }

  if (mimeType === "text/plain") {
    return "txt";
  }

  return mimeType.startsWith("image/") ? "jpg" : "bin";
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "upload";
}
