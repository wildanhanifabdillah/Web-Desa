import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  revokeAdminSession,
} from "@/lib/admin-auth-store";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, adminSessionCookieName);

  await revokeAdminSession(token);

  const response = NextResponse.json({
    data: {
      message: "Sesi admin berhasil dihapus.",
    },
  });

  response.cookies.set(adminSessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
}
