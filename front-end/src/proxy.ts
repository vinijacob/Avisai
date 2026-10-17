import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "avisai_token";
const PUBLIC_PATHS = ["/entrar", "/cadastro"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/eventos", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
