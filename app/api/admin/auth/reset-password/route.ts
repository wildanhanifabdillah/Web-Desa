import { NextResponse } from "next/server";
import { resetAdminPassword } from "@/lib/admin-auth-store";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isResetPasswordBody(body)) {
    return NextResponse.json(
      { error: "Token dan kata sandi baru wajib dikirim." },
      { status: 400 },
    );
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json(
      { error: "Konfirmasi kata sandi tidak sama." },
      { status: 400 },
    );
  }

  const result = await resetAdminPassword({
    token: body.token,
    password: body.password,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    data: {
      message: "Kata sandi admin berhasil diperbarui.",
      user: result.user,
    },
  });
}

function isResetPasswordBody(value: unknown): value is {
  token: string;
  password: string;
  confirmPassword: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.token === "string" &&
    typeof candidate.password === "string" &&
    typeof candidate.confirmPassword === "string"
  );
}
