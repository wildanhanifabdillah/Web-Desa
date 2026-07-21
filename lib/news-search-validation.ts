export type NewsSearchParams = {
  query: string | null;
  category: string | null;
  limit: number | null;
};

export type NewsSearchValidation =
  | {
      ok: true;
      params: NewsSearchParams;
    }
  | {
      ok: false;
      errors: Array<{
        field: "q" | "query" | "category" | "limit";
        message: string;
      }>;
    };

const MAX_QUERY_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;
const MAX_LIMIT = 50;

export function parseNewsSearchParams(
  searchParams: URLSearchParams,
  options: { requireQuery?: boolean } = {},
): NewsSearchValidation {
  const queryValue = searchParams.get("q") ?? searchParams.get("query");
  const categoryValue = searchParams.get("category");
  const limitValue = searchParams.get("limit");
  const query = queryValue?.trim() ?? null;
  const category = categoryValue?.trim() ?? null;
  const errors: Extract<NewsSearchValidation, { ok: false }>["errors"] = [];

  if (options.requireQuery && !query) {
    errors.push({
      field: "q",
      message: "Kata kunci pencarian wajib diisi.",
    });
  }

  if (query && query.length < 2) {
    errors.push({
      field: "q",
      message: "Kata kunci pencarian minimal 2 karakter.",
    });
  }

  if (query && query.length > MAX_QUERY_LENGTH) {
    errors.push({
      field: "q",
      message: `Kata kunci pencarian maksimal ${MAX_QUERY_LENGTH} karakter.`,
    });
  }

  if (category && category.length > MAX_CATEGORY_LENGTH) {
    errors.push({
      field: "category",
      message: `Kategori maksimal ${MAX_CATEGORY_LENGTH} karakter.`,
    });
  }

  let limit: number | null = null;

  if (limitValue) {
    limit = Number.parseInt(limitValue, 10);

    if (!Number.isInteger(limit) || limit.toString() !== limitValue.trim()) {
      errors.push({
        field: "limit",
        message: "Limit harus berupa angka bulat.",
      });
    } else if (limit < 1 || limit > MAX_LIMIT) {
      errors.push({
        field: "limit",
        message: `Limit harus di antara 1 sampai ${MAX_LIMIT}.`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    params: {
      query,
      category,
      limit,
    },
  };
}

