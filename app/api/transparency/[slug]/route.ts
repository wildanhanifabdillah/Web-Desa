import { getTransparencyRecord } from "@/lib/transparency-store";

export async function GET(
  _request: Request,
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

  return Response.json({
    data: document,
    meta: {
      slug,
    },
  });
}
