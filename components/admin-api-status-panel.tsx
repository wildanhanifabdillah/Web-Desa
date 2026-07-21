"use client";

import { useState } from "react";

type ApiEndpoint = {
  label: string;
  href: string;
};

type ApiCheckResult = ApiEndpoint & {
  status: "idle" | "ok" | "error";
  detail: string;
};

const apiEndpoints: ApiEndpoint[] = [
  { label: "Site Settings", href: "/api/site-settings" },
  { label: "Homepage Hero", href: "/api/homepage/hero-banner" },
  { label: "Homepage Profil", href: "/api/homepage/profile-summary" },
  { label: "Berita", href: "/api/news" },
  { label: "Statistik", href: "/api/statistics" },
  { label: "Profil", href: "/api/profile" },
  { label: "Potensi", href: "/api/potentials/categories" },
  { label: "Galeri Album", href: "/api/gallery" },
  { label: "Galeri Video", href: "/api/gallery/videos" },
  { label: "Transparansi", href: "/api/transparency" },
  { label: "Dokumen", href: "/api/documents" },
];

export function AdminApiStatusPanel() {
  const [results, setResults] = useState<ApiCheckResult[]>(
    apiEndpoints.map((endpoint) => ({
      ...endpoint,
      status: "idle",
      detail: "Menunggu cek",
    })),
  );
  const [isChecking, setIsChecking] = useState(false);

  async function checkEndpoints() {
    setIsChecking(true);

    const nextResults = await Promise.all(
      apiEndpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint.href, { cache: "no-store" });
          const payload = await response.json().catch(() => null);
          const count = getPayloadCount(payload);

          return {
            ...endpoint,
            status: response.ok ? "ok" : "error",
            detail: response.ok
              ? count === null
                ? `HTTP ${response.status}`
                : `${count} data / HTTP ${response.status}`
              : `HTTP ${response.status}`,
          } satisfies ApiCheckResult;
        } catch {
          return {
            ...endpoint,
            status: "error",
            detail: "Gagal tersambung",
          } satisfies ApiCheckResult;
        }
      }),
    );

    setResults(nextResults);
    setIsChecking(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Status API publik</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Klik cek untuk memanggil endpoint API lokal langsung dari browser.
          </p>
        </div>
        <button
          type="button"
          onClick={checkEndpoints}
          disabled={isChecking}
          className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sage-700 hover:text-sage-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isChecking ? "Mengecek" : "Cek API"}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {results.map((result) => (
          <div
            key={result.href}
            className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {result.label}
              </div>
              <code className="text-xs text-slate-500">{result.href}</code>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                result.status === "ok"
                  ? "bg-emerald-50 text-emerald-700"
                  : result.status === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {result.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPayloadCount(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as { data?: unknown; total?: unknown };

  if (Array.isArray(record.data)) {
    return record.data.length;
  }

  if (typeof record.total === "number") {
    return record.total;
  }

  return null;
}


