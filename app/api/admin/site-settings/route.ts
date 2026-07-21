import { getSiteSettings, resetSiteSettings, updateSiteSettings, type SiteSettingsInput } from "@/lib/site-settings";

export async function GET() {
  return Response.json({ data: getSiteSettings() });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null) as Partial<SiteSettingsInput> | null;

  if (!body) {
    return Response.json({ error: "Payload pengaturan website wajib dikirim." }, { status: 400 });
  }

  const updated = updateSiteSettings(body);

  if (!updated) {
    return Response.json({ error: "Data pengaturan website tidak valid." }, { status: 400 });
  }

  return Response.json({ data: updated });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset") !== "true") {
    return Response.json({ error: "Parameter reset=true wajib dikirim." }, { status: 400 });
  }

  return Response.json({ data: resetSiteSettings() });
}
