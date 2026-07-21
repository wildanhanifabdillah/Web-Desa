import {
  createTransparencyDocumentDownload,
} from "@/lib/transparency";
import { getTransparencyRecord } from "@/lib/transparency-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const document = await getTransparencyRecord(slug);

  if (!document) {
    return Response.json(
      {
        error: "Dokumen transparansi tidak ditemukan.",
        message: "Dokumen transparansi tidak ditemukan",
      },
      { status: 404 },
    );
  }

  if (document.fileUrl) {
    return Response.redirect(new URL(document.fileUrl, request.url));
  }

  const fileName = `${document.slug}.txt`;
  const body = createTransparencyDocumentDownload(document);

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
