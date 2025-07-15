// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/landing", "/api"];

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some((publicPath) => path.startsWith(publicPath));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret); // throws error if invalid or expired
    return NextResponse.next();
  } catch (err) {
    console.warn("JWT invalid:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// middleware.ts (append this)
export const config = {
  matcher: ["/((?!_next|favicon.ico|login|landing|api).*)"], // protect everything except public routes
};
