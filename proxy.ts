import { type NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookieName,
  getAdminSessionByToken,
} from "@/lib/admin-auth-store";

const publicAdminPagePaths = new Set([
  "/admin/login",
  "/admin/lupa-kata-sandi",
  "/admin/reset-password",
]);

const publicAdminApiPaths = new Set([
  "/api/admin/auth/login",
  "/api/admin/auth/forgot-password",
  "/api/admin/auth/reset-password",
  "/api/admin/auth/logout",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAdminRoute(pathname)) {
    return withAdminSecurityHeaders(NextResponse.next());
  }

  const sessionToken = request.cookies.get(adminSessionCookieName)?.value;
  const session = await getAdminSessionByToken(sessionToken);

  if (session) {
    const response = NextResponse.next();
    response.headers.set("x-admin-session", "authenticated");

    return withAdminSecurityHeaders(response);
  }

  if (pathname.startsWith("/api/admin")) {
    return withAdminSecurityHeaders(
      NextResponse.json(
        { error: "Sesi admin tidak valid atau sudah berakhir." },
        { status: 401 },
      ),
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return withAdminSecurityHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function isPublicAdminRoute(pathname: string) {
  return publicAdminPagePaths.has(pathname) || publicAdminApiPaths.has(pathname);
}

function withAdminSecurityHeaders(response: NextResponse) {
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "same-origin");
  response.headers.set("cache-control", "no-store");

  return response;
}
