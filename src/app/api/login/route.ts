import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : "";

  if (!name) {
    return NextResponse.json({ error: "表示名を入力してください" }, { status: 400 });
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "合言葉が違います" }, { status: 401 });
  }

  const token = await signSession(name);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });
  return res;
}
