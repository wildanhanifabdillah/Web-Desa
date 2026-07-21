import { getVillageRegulationRecord } from "@/lib/village-regulation-store";
import { createVillageRegulationDownload } from "@/lib/village-regulations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const regulation = await getVillageRegulationRecord(slug);

  if (!regulation) {
    return Response.json(
      {
        error: "Dokumen Perdes tidak ditemukan.",
        message: "Dokumen Perdes tidak ditemukan",
      },
      { status: 404 },
    );
  }

  const body = createVillageRegulationDownload(regulation);
  const fileName = `${regulation.slug}.txt`;

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
