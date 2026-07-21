import {
  isVillageRegulationStatus,
  listVillageRegulationRecords,
} from "@/lib/village-regulation-store";
import type { VillageRegulation } from "@/lib/village-regulations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? searchParams.get("query");
  const normalizedQuery = query?.trim();
  const category = searchParams.get("category");
  const yearValue = searchParams.get("year");
  const statusValue = searchParams.get("status");
  const limitValue = searchParams.get("limit");
  const year = yearValue ? Number.parseInt(yearValue, 10) : null;
  const limit = limitValue ? Number.parseInt(limitValue, 10) : null;
  const status = statusValue && isVillageRegulationStatus(statusValue) ? statusValue : null;

  if (!normalizedQuery) {
    return Response.json(
      { error: "Kata kunci pencarian wajib diisi." },
      { status: 400 },
    );
  }

  if (normalizedQuery.length < 2) {
    return Response.json(
      { error: "Kata kunci pencarian minimal 2 karakter." },
      { status: 400 },
    );
  }

  if (statusValue && !status) {
    return Response.json(
      {
        error: "Status dokumen tidak valid.",
        allowedStatus: ["Berlaku", "Arsip"],
      },
      { status: 400 },
    );
  }

  const records = await listVillageRegulationRecords();
  const result = filterRegulations(records, {
    query: normalizedQuery,
    category,
    year,
    status,
    limit,
  });

  return Response.json({
    data: result.data,
    meta: {
      total: result.total,
      available: result.available,
      query: result.query,
      category: result.category,
      year: result.year,
      status: result.status,
      limit: result.limit,
    },
  });
}

function filterRegulations(
  records: VillageRegulation[],
  {
    query,
    category,
    year,
    status,
    limit,
  }: {
    query?: string | null;
    category?: string | null;
    year?: number | null;
    status?: VillageRegulation["status"] | null;
    limit?: number | null;
  },
) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedCategory = category?.trim().toLowerCase();
  const normalizedStatus = status?.trim().toLowerCase();
  const filteredRegulations = records.filter((regulation) => {
    const searchableContent = [
      regulation.title,
      regulation.number,
      regulation.category,
      regulation.status,
      regulation.summary,
      regulation.year.toString(),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = normalizedQuery ? searchableContent.includes(normalizedQuery) : true;
    const matchesCategory = normalizedCategory
      ? regulation.category.toLowerCase() === normalizedCategory
      : true;
    const matchesYear = year ? regulation.year === year : true;
    const matchesStatus = normalizedStatus
      ? regulation.status.toLowerCase() === normalizedStatus
      : true;

    return matchesQuery && matchesCategory && matchesYear && matchesStatus;
  });
  const limitedRegulations = limit && Number.isFinite(limit) && limit > 0
    ? filteredRegulations.slice(0, limit)
    : filteredRegulations;

  return {
    data: limitedRegulations,
    total: limitedRegulations.length,
    available: filteredRegulations.length,
    query: normalizedQuery ?? null,
    category: normalizedCategory ?? null,
    year: year ?? null,
    status: normalizedStatus ?? null,
    limit: limit ?? null,
  };
}
