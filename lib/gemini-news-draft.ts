import { GoogleGenAI } from "@google/genai";
import type { AdminNewsInput } from "@/lib/admin-news-store";

export type GeminiNewsDraftInput = {
  topic: string;
  eventFact: string;
  location: string;
  eventDate: string;
  newsType?: string;
  category?: string;
  people?: string;
  supportingData?: string;
  style?: string;
  paragraphCount?: number;
  authorName?: string;
};

type GeminiNewsDraftResponse = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageAlt: string;
};

const fallbackModels = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash", "gemini-2.5-flash"];
const allowedParagraphRange = { min: 3, max: 6 };

export async function generateGeminiNewsDraft(input: GeminiNewsDraftInput) {
  const validation = validateGeminiNewsDraftInput(input);

  if (!validation.ok) {
    return validation;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false as const,
      status: 503,
      error: "GEMINI_API_KEY belum diisi di .env.local.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = getCandidateModels();
  const errors: string[] = [];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildPrompt(validation.input),
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });
      const text = response.text;

      if (!text) {
        errors.push(`${model}: respons kosong`);
        continue;
      }

      const parsed = parseDraftJson(text);

      if (!parsed) {
        errors.push(`${model}: format JSON tidak valid`);
        continue;
      }

      const draft: AdminNewsInput = {
        title: parsed.title.trim(),
        slug: "",
        excerpt: parsed.excerpt.trim(),
        content: normalizeParagraphs(parsed.content),
        category: parsed.category.trim() || validation.input.category || "Pemerintahan",
        imageUrl: "/images/berita/informasi-publik.jpg",
        imageAlt: parsed.imageAlt.trim() || `Ilustrasi ${validation.input.topic}`,
        authorName: validation.input.authorName || "Admin Desa Keseneng",
        isAiGenerated: true,
        status: "draft",
        publishedAt: null,
      };

      return { ok: true as const, data: draft, meta: { model } };
    } catch (error) {
      errors.push(`${model}: ${formatGeminiError(error)}`);
    }
  }

  return {
    ok: false as const,
    status: getGeminiFailureStatus(errors),
    error: `Gemini gagal membuat draft. ${errors.join(" | ")}`,
  };
}

function getCandidateModels() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const models = configuredModel ? [configuredModel, ...fallbackModels] : fallbackModels;

  return Array.from(new Set(models));
}

function formatGeminiError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "error tidak diketahui";
}

function getGeminiFailureStatus(errors: string[]) {
  const message = errors.join(" ").toLowerCase();

  if (message.includes("api key") || message.includes("permission") || message.includes("unauthorized") || message.includes("forbidden")) {
    return 401;
  }

  if (message.includes("api key not valid") || message.includes("invalid api key")) {
    return 401;
  }

  return 502;
}

function validateGeminiNewsDraftInput(input: GeminiNewsDraftInput) {
  const normalized = {
    topic: input.topic?.trim() ?? "",
    eventFact: input.eventFact?.trim() ?? "",
    location: input.location?.trim() ?? "",
    eventDate: normalizeDateInput(input.eventDate?.trim() ?? ""),
    newsType: input.newsType?.trim() || "Kegiatan",
    category: input.category?.trim() || "Pemerintahan",
    people: input.people?.trim() || "",
    supportingData: input.supportingData?.trim() || "",
    style: input.style?.trim() || "Portal berita",
    paragraphCount: clampParagraphCount(input.paragraphCount),
    authorName: input.authorName?.trim() || "Admin Desa Keseneng",
  };

  if (normalized.topic.length < 5) {
    return { ok: false as const, status: 400, error: "Topik utama minimal 5 karakter." };
  }

  if (normalized.eventFact.length < 20) {
    return { ok: false as const, status: 400, error: "Fakta kejadian minimal 20 karakter." };
  }

  if (normalized.location.length < 3) {
    return { ok: false as const, status: 400, error: "Lokasi kejadian wajib diisi." };
  }

  if (!normalized.eventDate) {
    return { ok: false as const, status: 400, error: "Tanggal kejadian tidak valid." };
  }

  return { ok: true as const, input: normalized };
}

function normalizeDateInput(value: string) {
  if (!value) {
    return "";
  }

  const directDate = new Date(value);

  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString().slice(0, 10);
  }

  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return "";
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function clampParagraphCount(value: number | undefined) {
  const paragraphCount = Number(value ?? 4);

  if (!Number.isFinite(paragraphCount)) {
    return 4;
  }

  return Math.min(allowedParagraphRange.max, Math.max(allowedParagraphRange.min, Math.round(paragraphCount)));
}

function buildPrompt(input: Required<GeminiNewsDraftInput>) {
  return [
    "Buat draft berita website desa dalam Bahasa Indonesia.",
    "Output harus JSON valid saja, tanpa markdown, tanpa komentar, tanpa teks tambahan.",
    "Jangan mengarang fakta spesifik yang tidak diberikan. Jika data opsional kosong, tulis secara umum dan tetap faktual.",
    `Gaya tulisan: ${input.style}.`,
    `Jumlah paragraf isi berita: ${input.paragraphCount}.`,
    "Struktur JSON wajib: {\"title\": string, \"excerpt\": string, \"content\": string, \"category\": string, \"imageAlt\": string}.",
    "Aturan konten: title maksimal 90 karakter, excerpt 1 kalimat ringkas maksimal 180 karakter, content beberapa paragraf dipisah dengan dua newline.",
    "",
    "Data berita:",
    `Topik/Judul utama: ${input.topic}`,
    `Jenis berita: ${input.newsType}`,
    `Kategori: ${input.category}`,
    `Apa yang terjadi: ${input.eventFact}`,
    `Siapa yang terlibat: ${input.people || "Tidak disebutkan"}`,
    `Lokasi dan tanggal kejadian: ${input.location}, ${formatEventDate(input.eventDate)}`,
    `Data pendukung atau kutipan narasumber: ${input.supportingData || "Tidak ada"}`,
  ].join("\n");
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function parseDraftJson(value: string): GeminiNewsDraftResponse | null {
  try {
    const cleaned = value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<GeminiNewsDraftResponse>;

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.excerpt !== "string" ||
      typeof parsed.content !== "string" ||
      typeof parsed.category !== "string" ||
      typeof parsed.imageAlt !== "string"
    ) {
      return null;
    }

    return parsed as GeminiNewsDraftResponse;
  } catch {
    return null;
  }
}

function normalizeParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join("\n\n");
}





