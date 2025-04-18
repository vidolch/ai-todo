import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  // Log authentication state for debugging
  console.log("Auth middleware:", {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    isAuthPage,
    tokenDetails: token ? { 
      name: token.name,
      email: token.email,
      tokenExpiry: token.exp
    } : null,
    cookies: request.cookies.getAll().map(c => c.name),
  });

  if (!token && !isAuthPage) {
    console.log("Redirecting to signin: No token and not on auth page");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (token && isAuthPage) {
    console.log("Redirecting to home: Has token and on auth page");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 