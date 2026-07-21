import { createAdminNews } from "@/lib/admin-news-store";
import {
  generateGeminiNewsDraft,
  type GeminiNewsDraftInput,
} from "@/lib/gemini-news-draft";

export async function POST(request: Request) {
  const body = await parseDraftRequest(request);

  if (!body) {
    return Response.json({ error: "Payload draft AI wajib dikirim." }, { status: 400 });
  }

  const draft = await generateGeminiNewsDraft(body);

  if (!draft.ok) {
    return Response.json({ error: draft.error }, { status: draft.status });
  }

  if (body.save === true) {
    const saved = await createAdminNews(draft.data);

    if (!saved.ok) {
      return Response.json({ error: saved.error }, { status: saved.status });
    }

    return Response.json({ data: saved.data, meta: { ...draft.meta, saved: true } }, { status: 201 });
  }

  return Response.json({ data: draft.data, meta: { ...draft.meta, saved: false } });
}

async function parseDraftRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return null;
    }

    return {
      topic: getFormString(formData, "topic") ?? "",
      eventFact: getFormString(formData, "eventFact") ?? "",
      location: getFormString(formData, "location") ?? "",
      eventDate: getFormString(formData, "eventDate") ?? "",
      newsType: getFormString(formData, "newsType") ?? undefined,
      category: getFormString(formData, "category") ?? undefined,
      people: getFormString(formData, "people") ?? undefined,
      supportingData: getFormString(formData, "supportingData") ?? undefined,
      style: getFormString(formData, "style") ?? undefined,
      paragraphCount: Number(getFormString(formData, "paragraphCount") ?? 4),
      authorName: getFormString(formData, "authorName") ?? undefined,
      save: getFormString(formData, "save") === "true",
    } satisfies GeminiNewsDraftInput & { save: boolean };
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as GeminiNewsDraftInput & { save?: boolean };

  return {
    topic: candidate.topic ?? "",
    eventFact: candidate.eventFact ?? "",
    location: candidate.location ?? "",
    eventDate: candidate.eventDate ?? "",
    newsType: candidate.newsType,
    category: candidate.category,
    people: candidate.people,
    supportingData: candidate.supportingData,
    style: candidate.style,
    paragraphCount: candidate.paragraphCount,
    authorName: candidate.authorName,
    save: candidate.save === true,
  } satisfies GeminiNewsDraftInput & { save: boolean };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
