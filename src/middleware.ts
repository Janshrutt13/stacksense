import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "./lib/auth";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

async function verifyAuth(token: string) {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyAuth(token) : false;

  // Root path
  if (request.nextUrl.pathname === "/") {
    // Not authenticated - redirect to auth
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    // Authenticated - allow access to landing page
    return NextResponse.next();
  }

  // Auth page
  if (request.nextUrl.pathname === "/auth") {
    // Already authenticated - redirect to landing page
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Not authenticated - allow access to auth page
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth"],
};
