import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  getAdminSessionByToken,
} from "@/lib/admin-auth-store";

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get("cookie") ?? "", adminSessionCookieName);
  const session = await getAdminSessionByToken(token);

  if (!session) {
    return NextResponse.json(
      { error: "Sesi admin tidak valid atau sudah berakhir." },
      { status: 401 },
    );
  }

  return NextResponse.json({ data: session });
}

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
}
