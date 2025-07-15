// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0), // Expire it immediately
    path: "/",
  });
  return response;
}
