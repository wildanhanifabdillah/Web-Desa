import { headers } from "next/headers";

export async function fetchPublicApi<T>(path: string) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = new URL(path, `${proto}://${host}`);
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `Gagal memuat ${path}`);
  }

  return payload as T;
}

export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};
