import { listTransparencyRecords } from "@/lib/transparency-store";
import type { TransparencyDocument } from "@/lib/transparency";

const validStatuses = new Set<TransparencyDocument["status"]>([
  "Dipublikasikan",
  "Draf",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("jenis_laporan") ??
    searchParams.get("jenis") ??
    searchParams.get("type") ??
    searchParams.get("category");
  const yearValue = searchParams.get("year");
  const statusValue = searchParams.get("status");
  const limitValue = searchParams.get("limit");
  const year = yearValue ? Number.parseInt(yearValue, 10) : null;
  const limit = limitValue ? Number.parseInt(limitValue, 10) : null;
  const status = statusValue && validStatuses.has(statusValue as TransparencyDocument["status"])
    ? statusValue as TransparencyDocument["status"]
    : null;

  if (statusValue && !status) {
    return Response.json(
      {
        error: "Status dokumen tidak valid.",
        allowedStatus: Array.from(validStatuses),
      },
      { status: 400 },
    );
  }

  const normalizedCategory = reportType?.trim().toLowerCase();
  const records = await listTransparencyRecords();
  const filteredDocuments = records.filter((document) => {
    const matchesCategory = normalizedCategory
      ? document.category.toLowerCase() === normalizedCategory
      : true;
    const matchesYear = year ? document.year === year : true;
    const matchesStatus = status ? document.status === status : true;

    return matchesCategory && matchesYear && matchesStatus;
  });
  const limitedDocuments = limit && Number.isFinite(limit) && limit > 0
    ? filteredDocuments.slice(0, limit)
    : filteredDocuments;

  return Response.json({
    data: limitedDocuments,
    meta: {
      total: limitedDocuments.length,
      available: filteredDocuments.length,
      category: normalizedCategory ?? null,
      reportType: normalizedCategory ?? null,
      year,
      status,
      limit,
    },
  });
}
