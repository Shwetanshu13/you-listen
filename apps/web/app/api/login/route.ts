// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { SignJWT } from "jose";
import { db } from "../../../../backend/src/lib/db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    const user = userList[0];

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(process.env.JWT_SECRET);

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, role: user.role },
    });

    res.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: true,
        sameSite: "lax",
      })
    );

    return res;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
