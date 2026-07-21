import {
  getActiveHomepageHeroBanner,
  resetHomepageHeroBanner,
  updateHomepageHeroBanner,
  type HomepageHeroBannerInput,
} from "@/lib/homepage-hero-banner";
import {
  getHomepageProfileSummary,
  resetHomepageProfileSummary,
  updateHomepageProfileSummary,
  type HomepageProfileSummaryInput,
} from "@/lib/homepage-profile-summary";
import { saveUploadedFile } from "@/lib/upload-files";

type HomepageSection = "hero" | "profileSummary";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

type HomepageUpdatePayload = {
  section?: HomepageSection;
  data?: unknown;
};

export async function GET() {
  const [hero, profileSummary] = await Promise.all([
    getActiveHomepageHeroBanner(),
    getHomepageProfileSummary(),
  ]);

  return Response.json({
    data: {
      hero,
      profileSummary,
    },
  });
}

export async function PUT(request: Request) {
  const parsed = await parseHomepageUpdateRequest(request);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  if (parsed.section === "hero") {
    const updated = updateHomepageHeroBanner(parsed.data as Partial<HomepageHeroBannerInput>);

    if (!updated) {
      return Response.json({ error: "Data hero homepage tidak valid." }, { status: 400 });
    }

    return Response.json({ data: updated, meta: parsed.upload });
  }

  if (parsed.section === "profileSummary") {
    const updated = updateHomepageProfileSummary(parsed.data as Partial<HomepageProfileSummaryInput>);

    if (!updated) {
      return Response.json(
        { error: "Data ringkasan profil homepage tidak valid." },
        { status: 400 },
      );
    }

    return Response.json({ data: updated, meta: parsed.upload });
  }

  return Response.json({ error: "Section homepage tidak dikenal." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const resetTarget = searchParams.get("reset");

  if (resetTarget === "hero") {
    return Response.json({ data: resetHomepageHeroBanner() });
  }

  if (resetTarget === "profileSummary") {
    return Response.json({ data: resetHomepageProfileSummary() });
  }

  if (resetTarget === "all") {
    return Response.json({
      data: {
        hero: resetHomepageHeroBanner(),
        profileSummary: resetHomepageProfileSummary(),
      },
    });
  }

  return Response.json(
    { error: "Parameter reset harus hero, profileSummary, atau all." },
    { status: 400 },
  );
}


async function parseHomepageUpdateRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return { ok: false as const, error: "Form homepage tidak valid.", status: 400 };
    }

    return parseHomepageFormData(formData);
  }

  const body = await parseJsonBody<HomepageUpdatePayload>(request);

  if (!body?.section || !body.data || typeof body.data !== "object") {
    return { ok: false as const, error: "Section dan data homepage wajib dikirim.", status: 400 };
  }

  return { ok: true as const, section: body.section, data: body.data, upload: null };
}

async function parseHomepageFormData(formData: FormData) {
  const section = getFormString(formData, "section") as HomepageSection | null;

  if (section !== "hero" && section !== "profileSummary") {
    return { ok: false as const, error: "Section homepage tidak dikenal.", status: 400 };
  }

  if (section === "profileSummary") {
    const data = getFormString(formData, "data");

    if (!data) {
      return { ok: false as const, error: "Data ringkasan profil wajib dikirim.", status: 400 };
    }

    return { ok: true as const, section, data: JSON.parse(data) as unknown, upload: null };
  }

  const dataValue = getFormString(formData, "data");
  const data = dataValue ? JSON.parse(dataValue) as Record<string, unknown> : {};
  const file = formData.get("file");
  let upload = null;

  if (file && !(file instanceof File)) {
    return { ok: false as const, error: "File gambar hero tidak valid.", status: 400 };
  }

  if (file instanceof File && file.size > 0) {
    const stored = await saveUploadedFile({
      file,
      directory: "homepage",
      prefix: "hero",
      allowedTypes: imageTypes,
      maxSize: maxImageSize,
    });

    if (!stored.ok) {
      return stored;
    }

    data.imageUrl = stored.data.url;
    upload = stored.data;
  }

  return { ok: true as const, section, data, upload };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
async function parseJsonBody<T>(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return null;
  }

  return body as T;
}


