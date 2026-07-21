import { NextResponse } from "next/server";
import { requestAdminPasswordReset } from "@/lib/admin-auth-store";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof (body as { email?: unknown }).email !== "string") {
    return NextResponse.json(
      { error: "Email admin wajib dikirim." },
      { status: 400 },
    );
  }

  const result = await requestAdminPasswordReset((body as { email: string }).email);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    data: {
      message: result.message,
      expiresIn: result.expiresIn,
      resetPath: result.resetPath,
    },
  });
}
