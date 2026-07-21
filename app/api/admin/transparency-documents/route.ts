import { listTransparencyRecords } from "@/lib/transparency-store";
import { listVillageRegulationRecords } from "@/lib/village-regulation-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase() ?? searchParams.get("query")?.trim().toLowerCase();
  const type = searchParams.get("type")?.trim().toLowerCase() ?? "all";
  const yearValue = searchParams.get("year");

  if (!["all", "transparency", "documents"].includes(type)) {
    return Response.json(
      { error: "Type harus all, transparency, atau documents." },
      { status: 400 },
    );
  }

  const year = yearValue ? Number.parseInt(yearValue, 10) : null;

  if (yearValue && (!Number.isInteger(year) || year?.toString() !== yearValue.trim())) {
    return Response.json({ error: "Tahun harus angka bulat." }, { status: 400 });
  }

  const [transparencyRecords, documentRecords] = await Promise.all([
    listTransparencyRecords(),
    listVillageRegulationRecords(),
  ]);

  const filteredTransparency = transparencyRecords.filter((record) => {
    const matchesYear = year ? record.year === year : true;
    const matchesQuery = query
      ? [record.title, record.slug, record.category, record.description, record.status]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesYear && matchesQuery;
  });
  const filteredDocuments = documentRecords.filter((record) => {
    const matchesYear = year ? record.year === year : true;
    const matchesQuery = query
      ? [record.title, record.slug, record.number, record.category, record.summary, record.status]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    return matchesYear && matchesQuery;
  });
  const data = {
    transparency: type === "documents" ? [] : filteredTransparency,
    documents: type === "transparency" ? [] : filteredDocuments,
  };

  return Response.json({
    data,
    meta: {
      type,
      totalTransparency: data.transparency.length,
      totalDocuments: data.documents.length,
      publishedTransparency: filteredTransparency.filter(
        (record) => record.status === "Dipublikasikan",
      ).length,
      draftTransparency: filteredTransparency.filter((record) => record.status === "Draf").length,
      activeDocuments: filteredDocuments.filter((record) => record.status === "Berlaku").length,
      archivedDocuments: filteredDocuments.filter((record) => record.status === "Arsip").length,
      query: query ?? null,
      year,
    },
  });
}
