import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  authenticateAdmin,
  type AdminLoginInput,
} from "@/lib/admin-auth-store";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isAdminLoginInput(body)) {
    return NextResponse.json(
      { error: "Username dan kata sandi wajib dikirim." },
      { status: 400 },
    );
  }

  const result = await authenticateAdmin(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const response = NextResponse.json({
    data: {
      user: result.user,
      session: {
        id: result.session.id,
        expiresAt: result.session.expiresAt,
      },
    },
  });

  response.cookies.set(adminSessionCookieName, result.session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: result.session.maxAge,
  });

  return response;
}

function isAdminLoginInput(value: unknown): value is AdminLoginInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AdminLoginInput> & { email?: unknown };
  const username = typeof candidate.username === "string" ? candidate.username : candidate.email;

  if (typeof username !== "string" || typeof candidate.password !== "string") {
    return false;
  }

  candidate.username = username;

  return true;
}
