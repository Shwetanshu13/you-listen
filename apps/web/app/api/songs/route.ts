// app/api/songs/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export async function GET(req: NextRequest) {
  const backendRes = await fetch(
    `${BACKEND_URL}/trpc/songs.getAll?batch=1&input=%7B%7D`,
    {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      credentials: "include",
    }
  );

  const data = await backendRes.json();
  console.log(data);
  return NextResponse.json(data[0]?.result?.data?.json ?? []);
}
