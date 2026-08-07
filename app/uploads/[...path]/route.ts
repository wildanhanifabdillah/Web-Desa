import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const uploadRoot = path.join(process.cwd(), "public", "uploads");
const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments = [] } = await context.params;

  if (segments.length === 0 || segments.some((segment) => segment.includes("..") || segment.includes("/") || segment.includes("\\"))) {
    return Response.json({ error: "Path upload tidak valid." }, { status: 400 });
  }

  const filePath = path.join(uploadRoot, ...segments);
  const relativePath = path.relative(uploadRoot, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return Response.json({ error: "Path upload tidak valid." }, { status: 400 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return Response.json({ error: "File upload tidak ditemukan." }, { status: 404 });
    }

    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "File upload tidak ditemukan." }, { status: 404 });
  }
}